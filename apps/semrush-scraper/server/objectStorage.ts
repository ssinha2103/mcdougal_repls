// Reference: javascript_object_storage blueprint - Screenshot storage
import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import * as fs from "fs";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

/**
 * Initialize Google Cloud Storage client
 * Supports two modes:
 * 1. Replit environment: Uses sidecar for authentication
 * 2. Docker/Local: Uses standard GCS credentials file or Application Default Credentials
 */
function initializeStorageClient(): Storage {
  // Check if running in Replit environment (sidecar available)
  const isReplit = process.env.REPL_ID !== undefined;
  
  // Check if running with explicit GCS credentials file (Docker/Local)
  const gcsCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (gcsCredentialsPath && fs.existsSync(gcsCredentialsPath)) {
    // Docker/Local mode with credentials file
    console.log("[OBJECT_STORAGE] Using GCS credentials file:", gcsCredentialsPath);
    return new Storage({
      keyFilename: gcsCredentialsPath,
      projectId: process.env.GCS_PROJECT_ID || "",
    });
  } else if (isReplit) {
    // Replit environment with sidecar
    console.log("[OBJECT_STORAGE] Using Replit sidecar for GCS authentication");
    return new Storage({
      credentials: {
        audience: "replit",
        subject_token_type: "access_token",
        token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
        type: "external_account",
        credential_source: {
          url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
          format: {
            type: "json",
            subject_token_field_name: "access_token",
          },
        },
        universe_domain: "googleapis.com",
      },
      projectId: "",
    });
  } else {
    // Fallback to Application Default Credentials (gcloud CLI)
    console.log("[OBJECT_STORAGE] Using Application Default Credentials");
    return new Storage({
      projectId: process.env.GCS_PROJECT_ID || "",
    });
  }
}

export const objectStorageClient = initializeStorageClient();

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class ObjectStorageService {
  private bucketId: string;
  private privateDir: string;

  constructor() {
    // Support both Replit and Docker/Local bucket configuration
    this.bucketId = 
      process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || 
      process.env.GCS_BUCKET_NAME || 
      "";
    this.privateDir = process.env.PRIVATE_OBJECT_DIR || ".private";

    if (!this.bucketId) {
      throw new Error(
        "Bucket not configured. Set either DEFAULT_OBJECT_STORAGE_BUCKET_ID (Replit) or GCS_BUCKET_NAME (Docker/Local)"
      );
    }
    
    console.log(`[OBJECT_STORAGE] Using bucket: ${this.bucketId}`);
  }

  /**
   * Upload screenshot to object storage
   */
  async uploadScreenshot(
    localPath: string,
    domain: string,
    runId: string,
    sectionType: string
  ): Promise<string> {
    const bucket = objectStorageClient.bucket(this.bucketId);
    const fileName = `${this.privateDir}/screenshots/${runId}/${domain}/${sectionType}.png`;
    const file = bucket.file(fileName);

    await bucket.upload(localPath, {
      destination: fileName,
      metadata: {
        contentType: "image/png",
        metadata: {
          domain,
          runId,
          sectionType,
        },
      },
    });

    return fileName;
  }

  /**
   * Get screenshot file
   */
  async getScreenshotFile(path: string): Promise<File> {
    const bucket = objectStorageClient.bucket(this.bucketId);
    const file = bucket.file(path);

    const [exists] = await file.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }

    return file;
  }

  /**
   * Download screenshot to response
   */
  async downloadScreenshot(path: string, res: Response): Promise<void> {
    try {
      const file = await this.getScreenshotFile(path);
      const [metadata] = await file.getMetadata();

      res.setHeader("Content-Type", metadata.contentType || "image/png");
      res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year

      file.createReadStream().pipe(res);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        res.status(404).json({ error: "Screenshot not found" });
      } else {
        console.error("Error downloading screenshot:", error);
        res.status(500).json({ error: "Failed to download screenshot" });
      }
    }
  }

  /**
   * Get screenshot as buffer for ZIP export
   */
  async getScreenshotBuffer(path: string): Promise<Buffer | null> {
    try {
      const file = await this.getScreenshotFile(path);
      const [buffer] = await file.download();
      return buffer;
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete screenshots for a run
   */
  async deleteRunScreenshots(runId: string): Promise<void> {
    const bucket = objectStorageClient.bucket(this.bucketId);
    const prefix = `${this.privateDir}/screenshots/${runId}/`;

    const [files] = await bucket.getFiles({ prefix });

    await Promise.all(
      files.map((file) => file.delete().catch((err) => {
        console.error(`Failed to delete ${file.name}:`, err);
      }))
    );
  }
}
