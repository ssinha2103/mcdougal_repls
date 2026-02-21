import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { downloadRequestSchema } from "@shared/schema";
import { log } from "./index";
import multer from "multer";
import { parse } from "csv-parse/sync";
import archiver from "archiver";
import * as XLSX from "xlsx";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

function parseReplitUrl(url: string): { username: string; replName: string; isTeam: boolean; teamName?: string } | null {
  const teamUrl = url.match(/replit\.com\/t\/([\w-]+)\/repls\/([\w-]+)/);
  if (teamUrl) {
    return { username: teamUrl[1], replName: teamUrl[2], isTeam: true, teamName: teamUrl[1] };
  }
  const withAt = url.match(/replit\.com\/@([\w-]+)\/([\w-]+)/);
  if (withAt) {
    return { username: withAt[1], replName: withAt[2], isTeam: false };
  }
  const withoutAt = url.match(/replit\.com\/([\w-]+)\/([\w-]+)/);
  if (withoutAt) {
    return { username: withoutAt[1], replName: withoutAt[2], isTeam: false };
  }
  return null;
}

function buildZipUrl(info: { username: string; replName: string; isTeam: boolean; teamName?: string }): string {
  if (info.isTeam && info.teamName) {
    return `https://replit.com/t/${info.teamName}/repls/${info.replName}.zip`;
  }
  return `https://replit.com/@${info.username}/${info.replName}.zip`;
}

function getReplitHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (compatible; ReplitDownloader/1.0)",
  };
  const cookie = process.env.REPLIT_CONNECT_SID;
  if (cookie) {
    headers["Cookie"] = `connect.sid=${cookie}`;
  }
  return headers;
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface ExtractedProject {
  url: string;
  username: string;
  replName: string;
  appName: string;
}

function extractProjectsFromRows(rows: Record<string, string>[]): ExtractedProject[] {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const normalizedMap: Record<string, string> = {};
  for (const h of headers) {
    normalizedMap[normalizeHeader(h)] = h;
  }

  const slugKey = normalizedMap["slug"] || normalizedMap["replslug"] || null;
  const appNameKey = normalizedMap["appname"] || normalizedMap["app"] || normalizedMap["name"] || normalizedMap["projectname"] || normalizedMap["replname"] || normalizedMap["project"] || null;
  const usernameKey = normalizedMap["creatorusername"] || normalizedMap["username"] || normalizedMap["creator"] || normalizedMap["user"] || normalizedMap["creatoruser"] || normalizedMap["owner"] || null;
  const teamKey = normalizedMap["teamname"] || normalizedMap["team"] || normalizedMap["organization"] || normalizedMap["org"] || normalizedMap["teamslug"] || null;

  if ((!appNameKey && !slugKey) || (!usernameKey && !teamKey)) return [];

  const projects: ExtractedProject[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const appName = (appNameKey ? row[appNameKey] : "").trim();
    const slug = (slugKey ? row[slugKey] : "").trim();
    const username = (usernameKey ? row[usernameKey] : "").trim();
    const team = (teamKey ? row[teamKey] : "").trim();

    if ((!appName && !slug) || (!username && !team)) continue;

    const replName = slug || appName
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!replName) continue;

    const owner = team || username;
    const key = `${owner}/${replName}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const url = team
      ? `https://replit.com/t/${team}/repls/${replName}`
      : `https://replit.com/@${username}/${replName}`;
    projects.push({ url, username: owner, replName, appName: appName || slug });
  }

  return projects;
}

function parseFileToRows(buffer: Buffer, filename: string): Record<string, string>[] | null {
  const ext = filename.toLowerCase().split(".").pop();

  if (ext === "xlsx" || ext === "xls") {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) return null;
      const sheet = workbook.Sheets[sheetName];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      return rows.map((row) => {
        const cleaned: Record<string, string> = {};
        for (const [k, v] of Object.entries(row)) {
          cleaned[k] = String(v);
        }
        return cleaned;
      });
    } catch (e: any) {
      log(`Excel parse error: ${e.message}`);
      return null;
    }
  }

  if (ext === "csv" || ext === "txt") {
    try {
      const content = buffer.toString("utf-8");
      const records: string[][] = parse(content, {
        relax_column_count: true,
        relax_quotes: true,
        trim: true,
        skip_empty_lines: true,
      });

      if (records.length < 2) return null;

      const headers = records[0];
      const rows: Record<string, string>[] = [];
      for (let i = 1; i < records.length; i++) {
        const row: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
          row[headers[j]] = records[i][j] || "";
        }
        rows.push(row);
      }
      return rows;
    } catch {
      return null;
    }
  }

  return null;
}

function extractProjectsFromFile(buffer: Buffer, filename: string): ExtractedProject[] {
  const rows = parseFileToRows(buffer, filename);

  if (rows && rows.length > 0) {
    const columnProjects = extractProjectsFromRows(rows);
    if (columnProjects.length > 0) {
      return columnProjects;
    }
  }

  const content = buffer.toString("utf-8");
  const urls = extractReplitUrlsFromText(content);
  return urls.map((url) => {
    const info = parseReplitUrl(url);
    return {
      url,
      username: info?.username || "unknown",
      replName: info?.replName || "unknown",
      appName: info?.replName || "unknown",
    };
  }).filter((p) => p.username !== "unknown");
}

function extractReplitUrlsFromText(content: string): string[] {
  const urlPattern = /https?:\/\/replit\.com\/(?:t\/[\w-]+\/repls\/[\w-]+|@?[\w-]+\/[\w-]+)/g;
  const allUrls: string[] = [];

  try {
    const records: string[][] = parse(content, {
      relax_column_count: true,
      relax_quotes: true,
      trim: true,
      skip_empty_lines: true,
    });

    for (const row of records) {
      for (const cell of row) {
        const matches = cell.match(urlPattern);
        if (matches) {
          allUrls.push(...matches);
        }
      }
    }
  } catch {
    const matches = content.match(urlPattern) || [];
    allUrls.push(...matches);
  }

  return Array.from(new Set(allUrls));
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/download", async (req, res) => {
    try {
      const parsed = downloadRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.errors[0]?.message || "Invalid URL",
        });
      }

      const { url } = parsed.data;
      const info = parseReplitUrl(url);
      if (!info) {
        return res.status(400).json({
          message: "Could not parse the Replit URL. Please use a format like https://replit.com/@username/project-name",
        });
      }

      const { username, replName } = info;
      const zipUrl = buildZipUrl(info);

      log(`Fetching ZIP from: ${zipUrl}`);

      const response = await fetch(zipUrl, {
        redirect: "follow",
        headers: getReplitHeaders(),
      });

      if (!response.ok) {
        log(`Failed to fetch ZIP: ${response.status} ${response.statusText}`);

        await storage.createDownload({
          replitUrl: url,
          replName,
          username,
          status: "failed",
        });

        if (response.status === 404) {
          return res.status(404).json({
            message: "Project not found. Make sure the Replit project exists and is public.",
          });
        }
        return res.status(502).json({
          message: `Failed to download from Replit (status ${response.status}). The project may be private or unavailable.`,
        });
      }

      await storage.createDownload({
        replitUrl: url,
        replName,
        username,
        status: "completed",
      });

      const filename = `${replName}.zip`;
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      if (response.body) {
        const { Readable } = await import("stream");
        const readable = Readable.fromWeb(response.body as any);
        readable.pipe(res);
      } else {
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
      }
    } catch (error: any) {
      log(`Download error: ${error.message}`);
      return res.status(500).json({
        message: "An unexpected error occurred while downloading the project.",
      });
    }
  });

  app.post("/api/bulk-download", upload.single("csv"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const projects = extractProjectsFromFile(req.file.buffer, req.file.originalname);

      if (projects.length === 0) {
        return res.status(400).json({
          message: "No valid Replit projects found. Upload a file with columns 'App Name' and 'Creator Username', or a file containing Replit URLs.",
        });
      }

      if (projects.length > 50) {
        return res.status(400).json({
          message: `Found ${projects.length} projects but the limit is 50 per batch. Please split your file into smaller files.`,
        });
      }

      log(`Bulk download: processing ${projects.length} projects`);

      const archive = archiver("zip", { zlib: { level: 5 } });
      const filename = `replit-bulk-download-${Date.now()}.zip`;

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

      archive.on("error", (err) => {
        log(`Archiver error: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({ message: "Failed to create ZIP archive." });
        } else {
          res.end();
        }
      });

      archive.pipe(res);

      const results: { url: string; status: string; name: string }[] = [];

      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
      let consecutiveRateLimits = 0;

      const fetchWithRetry = async (zipUrl: string, maxRetries: number = 4): Promise<Response | null> => {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          const response = await fetch(zipUrl, {
            redirect: "follow",
            headers: getReplitHeaders(),
          });
          if (response.status === 429) {
            consecutiveRateLimits++;
            if (attempt < maxRetries) {
              const backoff = Math.pow(2, attempt + 1) * 3000 + consecutiveRateLimits * 5000;
              log(`Bulk: rate limited on ${zipUrl}, waiting ${Math.round(backoff / 1000)}s before retry ${attempt + 1}/${maxRetries}`);
              await delay(backoff);
              continue;
            }
          } else {
            consecutiveRateLimits = 0;
          }
          return response;
        }
        return null;
      };

      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        const { url, username, replName } = project;
        const parsedInfo = parseReplitUrl(url);
        const zipUrl = parsedInfo ? buildZipUrl(parsedInfo) : `https://replit.com/@${username}/${replName}.zip`;

        try {
          if (i > 0) {
            const baseDelay = 3000 + consecutiveRateLimits * 5000;
            await delay(baseDelay);
          }

          log(`Bulk: fetching ${zipUrl} (${i + 1}/${projects.length})`);
          const response = await fetchWithRetry(zipUrl);

          if (!response || !response.ok) {
            const status = response?.status || "timeout";
            log(`Bulk: failed ${zipUrl} (${status})`);
            results.push({ url, status: "failed", name: replName });
            await storage.createDownload({
              replitUrl: url,
              replName,
              username,
              status: "failed",
            });
            continue;
          }

          const buffer = Buffer.from(await response.arrayBuffer());
          archive.append(buffer, { name: `${username}-${replName}.zip` });
          results.push({ url, status: "completed", name: replName });

          await storage.createDownload({
            replitUrl: url,
            replName,
            username,
            status: "completed",
          });
        } catch (err: any) {
          log(`Bulk: error for ${url}: ${err.message}`);
          results.push({ url, status: "error", name: replName });
        }
      }

      const summary = results
        .map((r) => `${r.status}: ${r.url}`)
        .join("\n");
      archive.append(summary, { name: "download-report.txt" });

      await archive.finalize();
    } catch (error: any) {
      log(`Bulk download error: ${error.message}`);
      if (!res.headersSent) {
        return res.status(500).json({
          message: "An unexpected error occurred during bulk download.",
        });
      }
    }
  });

  app.post("/api/parse-csv", upload.single("csv"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      const projects = extractProjectsFromFile(req.file.buffer, req.file.originalname);

      const parsed = projects.map((p) => ({
        url: p.url,
        username: p.username,
        replName: p.replName,
        appName: p.appName,
        valid: true,
      }));

      res.json({ urls: parsed, total: parsed.length });
    } catch (error: any) {
      log(`File parse error: ${error.message}`);
      return res.status(500).json({ message: "Failed to parse the uploaded file." });
    }
  });

  app.get("/api/downloads", async (_req, res) => {
    try {
      const downloads = await storage.getRecentDownloads(20);
      res.json(downloads);
    } catch (error: any) {
      log(`Error fetching downloads: ${error.message}`);
      return res.status(500).json({ message: "Failed to fetch download history." });
    }
  });

  return httpServer;
}
