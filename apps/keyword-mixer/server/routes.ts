import { Express } from "express";
import { z } from "zod";
import { createServer } from "http";
import { exportRequestSchema } from "@shared/schema";

interface JobStatus {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  results: any | null;
  error: string | null;
  expectedCombinations?: number;
}

const jobStore = new Map<string, JobStatus>();

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function scheduleJobCleanup(jobId: string, delayMs: number = 5 * 60 * 1000) {
  setTimeout(() => {
    jobStore.delete(jobId);
    console.log(`Cleaned up job: ${jobId}`);
  }, delayMs);
}

// Validation schemas
const generateKeywordsSchema = z.object({
  groups: z.array(z.object({
    id: z.string(),
    name: z.string(),
    keywords: z.array(z.string())
  })),
  settings: z.object({
    pattern: z.string(),
    matchType: z.string(),
    separator: z.string(),
    includeReverse: z.boolean().optional(),
    includeOriginal: z.boolean().optional(),
    removeStopwords: z.boolean().optional(),
    lowercaseOutput: z.boolean().optional(),
    customSeparator: z.string().optional()
  }),
  filters: z.object({
    minWords: z.number().optional(),
    maxWords: z.number().optional(),
    minChars: z.number().optional(),
    maxChars: z.number().optional(),
    mustInclude: z.string().optional(),
    mustExclude: z.string().optional()
  })
});

const keywordResearchSchema = z.object({
  seedKeyword: z.string().min(1)
});

// Helper functions
function generateCartesianProduct(arrays: string[][]): string[] {
  return arrays.reduce<string[]>((acc, curr) => {
    if (acc.length === 0) return curr;
    const result: string[] = [];
    for (const a of acc) {
      for (const c of curr) {
        const combined = c === '' ? a : `${a} ${c}`;
        result.push(combined.trim());
      }
    }
    return result;
  }, []);
}

function generatePairs(arrays: string[][]): string[] {
  const result: string[] = [];
  for (let i = 0; i < arrays.length; i++) {
    for (let j = i + 1; j < arrays.length; j++) {
      for (const a of arrays[i]) {
        for (const b of arrays[j]) {
          const combined = b === '' ? a : (a === '' ? b : `${a} ${b}`);
          const trimmed = combined.trim();
          if (trimmed !== '') {  // Only push non-empty combinations
            result.push(trimmed);
          }
        }
      }
    }
  }
  return result;
}

function formatMatchType(keyword: string, matchType: string): string {
  switch (matchType) {
    case 'phrase':
      return `"${keyword}"`;
    case 'exact':
      return `[${keyword}]`;
    case 'modified':
      return keyword.split(' ').map(word => `+${word}`).join(' ');
    case 'broad':
    default:
      return keyword;
  }
}

function applySeparator(keyword: string, separator: string, customSeparator?: string): string {
  const sep = separator === 'custom' ? (customSeparator || ' ') :
            separator === 'dash' ? '-' :
            separator === 'underscore' ? '_' :
            separator === 'none' ? '' : ' ';
            
  return keyword.replace(/\s+/g, sep);
}

function applyFilters(keywords: string[], filters: any): string[] {
  return keywords.filter(keyword => {
    const wordCount = keyword.split(/\s+/).length;
    const charCount = keyword.length;

    if (filters.minWords && wordCount < filters.minWords) return false;
    if (filters.maxWords && wordCount > filters.maxWords) return false;
    if (filters.minChars && charCount < filters.minChars) return false;
    if (filters.maxChars && charCount > filters.maxChars) return false;
    if (filters.mustInclude && !keyword.toLowerCase().includes(filters.mustInclude.toLowerCase())) return false;
    if (filters.mustExclude && keyword.toLowerCase().includes(filters.mustExclude.toLowerCase())) return false;

    return true;
  });
}

function normalizeKeywordGroups(groups: any[]): any[] {
  return groups
    .map((group: any, index: number) => {
      const trimmedKeywords = group.keywords.map((keyword: string) => keyword.trim());
      const nonEmptyKeywords = trimmedKeywords.filter((keyword: string) => keyword.length > 0);

      if (index === 0) {
        return {
          ...group,
          keywords: nonEmptyKeywords,
        };
      }

      // Non-primary groups are optional. Keep an explicit blank variant so
      // users can generate output even when list B/C are left empty.
      if (nonEmptyKeywords.length === 0) {
        return {
          ...group,
          keywords: [""],
        };
      }

      const hasBlankVariant = trimmedKeywords.some((keyword: string) => keyword.length === 0);
      const optionalKeywords = hasBlankVariant
        ? [...nonEmptyKeywords, ""]
        : nonEmptyKeywords;

      return {
        ...group,
        keywords: Array.from(new Set(optionalKeywords)),
      };
    })
    .filter((group: any, index: number) => index === 0 ? group.keywords.length > 0 : true);
}

function processKeywords(groups: any[], settings: any, filters: any, onProgress?: (progress: number) => void) {
  const validGroups = normalizeKeywordGroups(groups);
  
  if (validGroups.length === 0 || validGroups[0].keywords.length === 0) {
    throw new Error('At least the first group must have keywords');
  }

  let combinations: string[] = [];
  
  if (settings.pattern === 'full') {
    combinations = generateCartesianProduct(validGroups.map((g: any) => g.keywords));
  } else if (settings.pattern === 'pairs') {
    combinations = generatePairs(validGroups.map((g: any) => g.keywords));
  }

  if (settings.includeOriginal) {
    const originalKeywords = groups.flatMap((group: any) => 
      group.keywords.filter((k: string) => k.trim().length > 0)
    );
    combinations = [...combinations, ...originalKeywords];
  }

  if (settings.includeReverse && settings.pattern === 'full') {
    const reversed = combinations.map(combo => combo.split(' ').reverse().join(' '));
    combinations = [...combinations, ...reversed];
  }

  const totalCombinations = combinations.length;
  const chunkSize = 10000;
  let processedCombinations: string[] = [];

  for (let i = 0; i < combinations.length; i += chunkSize) {
    const chunk = combinations.slice(i, i + chunkSize);
    
    let processedChunk = chunk.map(keyword => formatMatchType(keyword, settings.matchType));
    
    if (settings.separator !== 'space') {
      processedChunk = processedChunk.map(keyword => applySeparator(keyword, settings.separator, settings.customSeparator));
    }
    
    if (settings.lowercaseOutput) {
      processedChunk = processedChunk.map(keyword => keyword.toLowerCase());
    }
    
    processedCombinations.push(...processedChunk);
    
    if (onProgress) {
      const progress = Math.min(((i + chunkSize) / totalCombinations) * 100, 100);
      onProgress(progress);
    }
  }

  processedCombinations = applyFilters(processedCombinations, filters);
  processedCombinations = Array.from(new Set(processedCombinations));

  const results = processedCombinations.map(keyword => ({
    keyword,
    wordCount: keyword.split(/\s+/).length,
    charCount: keyword.length
  }));
  const avgWordCount = results.length > 0
    ? results.reduce((sum, r) => sum + r.wordCount, 0) / results.length
    : 0;
  const avgCharCount = results.length > 0
    ? results.reduce((sum, r) => sum + r.charCount, 0) / results.length
    : 0;

  return {
    keywords: results,
    totalCombinations: results.length,
    stats: {
      avgWordCount,
      avgCharCount
    }
  };
}

function processKeywordsAsync(
  jobId: string,
  groups: any[],
  settings: any,
  filters: any,
  expectedCombinations: number
): void {
  const startTime = Date.now();
  
  const validGroups = normalizeKeywordGroups(groups);
  
  if (validGroups.length === 0 || validGroups[0].keywords.length === 0) {
    jobStore.set(jobId, {
      status: 'failed',
      progress: 0,
      results: null,
      error: 'At least the first group must have keywords',
      expectedCombinations
    });
    scheduleJobCleanup(jobId, 60000);
    return;
  }

  let combinations: string[] = [];
  
  if (settings.pattern === 'full') {
    combinations = generateCartesianProduct(validGroups.map((g: any) => g.keywords));
  } else if (settings.pattern === 'pairs') {
    combinations = generatePairs(validGroups.map((g: any) => g.keywords));
  }

  if (settings.includeOriginal) {
    const originalKeywords = groups.flatMap((group: any) => 
      group.keywords.filter((k: string) => k.trim().length > 0)
    );
    combinations = [...combinations, ...originalKeywords];
  }

  if (settings.includeReverse && settings.pattern === 'full') {
    const reversed = combinations.map(combo => combo.split(' ').reverse().join(' '));
    combinations = [...combinations, ...reversed];
  }

  const totalCombinations = combinations.length;
  const CHUNK_SIZE = 5000;
  let processedCombinations: string[] = [];
  let currentIndex = 0;

  function processChunk() {
    try {
      if (currentIndex >= combinations.length) {
        processedCombinations = applyFilters(processedCombinations, filters);
        processedCombinations = Array.from(new Set(processedCombinations));

        const results = processedCombinations.map(keyword => ({
          keyword,
          wordCount: keyword.split(/\s+/).length,
          charCount: keyword.length
        }));
        const avgWordCount = results.length > 0
          ? results.reduce((sum, r) => sum + r.wordCount, 0) / results.length
          : 0;
        const avgCharCount = results.length > 0
          ? results.reduce((sum, r) => sum + r.charCount, 0) / results.length
          : 0;

        const processingTime = (Date.now() - startTime) / 1000;

        const finalResult = {
          keywords: results,
          totalCombinations: results.length,
          stats: {
            avgWordCount,
            avgCharCount
          },
          processingTime
        };

        jobStore.set(jobId, {
          status: 'completed',
          progress: 100,
          results: finalResult,
          error: null,
          expectedCombinations
        });

        scheduleJobCleanup(jobId);
        return;
      }

      const chunk = combinations.slice(currentIndex, currentIndex + CHUNK_SIZE);
      
      let processedChunk = chunk.map(keyword => formatMatchType(keyword, settings.matchType));
      
      if (settings.separator !== 'space') {
        processedChunk = processedChunk.map(keyword => applySeparator(keyword, settings.separator, settings.customSeparator));
      }
      
      if (settings.lowercaseOutput) {
        processedChunk = processedChunk.map(keyword => keyword.toLowerCase());
      }
      
      processedCombinations.push(...processedChunk);
      
      currentIndex += CHUNK_SIZE;
      const progress = Math.min((currentIndex / totalCombinations) * 100, 100);
      
      const job = jobStore.get(jobId);
      if (job) {
        job.progress = Math.round(progress);
        jobStore.set(jobId, job);
      }

      setTimeout(processChunk, 0);
    } catch (error) {
      jobStore.set(jobId, {
        status: 'failed',
        progress: 0,
        results: null,
        error: error instanceof Error ? error.message : 'Failed to process keywords',
        expectedCombinations
      });
      scheduleJobCleanup(jobId, 60000);
    }
  }

  processChunk();
}

function validateRequest(schema: z.ZodSchema<any>) {
  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: Date.now() 
    });
  });

  // Generate keywords endpoint (synchronous)
  app.post('/api/generate-keywords', validateRequest(generateKeywordsSchema), async (req, res) => {
    const startTime = Date.now();
    const { groups, settings, filters } = req.body;

    try {
      const result = processKeywords(groups, settings, filters);
      const processingTime = (Date.now() - startTime) / 1000;

      res.json({
        ...result,
        processingTime
      });

    } catch (error) {
      console.error('Error generating keywords:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate keywords' });
    }
  });

  // Generate keywords async endpoint (for large datasets)
  app.post('/api/generate-keywords-async', validateRequest(generateKeywordsSchema), async (req, res) => {
    const { groups, settings, filters } = req.body;

    try {
      const jobId = generateJobId();

      const validGroups = normalizeKeywordGroups(groups);

      let expectedCombinations = 0;
      if (settings.pattern === 'full') {
        expectedCombinations = validGroups.reduce((acc: number, group: any) => 
          acc === 0 ? group.keywords.length : acc * group.keywords.length, 0);
      } else if (settings.pattern === 'pairs') {
        for (let i = 0; i < validGroups.length; i++) {
          for (let j = i + 1; j < validGroups.length; j++) {
            expectedCombinations += validGroups[i].keywords.length * validGroups[j].keywords.length;
          }
        }
      }

      jobStore.set(jobId, {
        status: 'processing',
        progress: 0,
        results: null,
        error: null,
        expectedCombinations
      });

      res.json({ jobId, expectedCombinations });

      processKeywordsAsync(jobId, groups, settings, filters, expectedCombinations);

    } catch (error) {
      console.error('Error starting async keyword generation:', error);
      res.status(500).json({ error: 'Failed to start keyword generation' });
    }
  });

  // Get job status endpoint
  app.get('/api/job-status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = jobStore.get(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  });

  // DataForSEO keyword research endpoint
  app.post('/api/keyword-research', validateRequest(keywordResearchSchema), async (req, res) => {
    const { seedKeyword } = req.body;

    try {
      const login = process.env.DATAFORSEO_API_LOGIN || process.env.DATAFORSEO_LOGIN;
      const password = process.env.DATAFORSEO_API_PASSWORD || process.env.DATAFORSEO_PASSWORD;

      if (!login || !password) {
        return res.status(400).json({ error: 'DataForSEO credentials not configured' });
      }

      // Create basic auth header
      const auth = Buffer.from(`${login}:${password}`).toString('base64');

      // DataForSEO keyword suggestions endpoint
      const dataforSeoResponse = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/keywords_for_keywords/live', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([{
          keywords: [seedKeyword],
          location_code: 2840, // USA
          language_code: "en",
          include_seed_keyword: true,
          limit: 100
        }])
      });

      const responseText = await dataforSeoResponse.text();
      let data: any = null;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch {
        console.error('DataForSEO non-JSON response:', responseText?.slice(0, 500));
        return res.status(502).json({ error: 'Invalid response format from DataForSEO' });
      }

      if (!dataforSeoResponse.ok) {
        const message =
          data?.status_message ||
          data?.tasks?.[0]?.status_message ||
          `HTTP ${dataforSeoResponse.status}`;
        console.error('DataForSEO API error:', message);
        return res.status(502).json({ error: `DataForSEO request failed: ${message}` });
      }

      if (data?.status_code && data.status_code !== 20000) {
        const message = data?.status_message || `status_code=${data.status_code}`;
        return res.status(502).json({ error: `DataForSEO error: ${message}` });
      }

      const task = data?.tasks?.[0];
      if (!task) {
        return res.status(502).json({ error: 'Invalid response from DataForSEO: missing task' });
      }

      if (task?.status_code && task.status_code !== 20000) {
        const message = task?.status_message || `status_code=${task.status_code}`;
        return res.status(502).json({ error: `DataForSEO task error: ${message}` });
      }

      const firstResult = Array.isArray(task.result) ? task.result[0] : null;
      const items = Array.isArray(firstResult?.items)
        ? firstResult.items
        : Array.isArray(task.result)
          ? task.result
          : [];

      const keywords = items
        .filter((item: any) => typeof item?.keyword === 'string' && item.keyword.length > 0)
        .map((item: any) => ({
          keyword: item.keyword,
          searchVolume: item.search_volume || 0,
          competition: item.competition || 0,
          cpc: item.cpc || 0
        }));

      res.json({ keywords });

    } catch (error) {
      console.error('Error fetching keyword research:', error);
      res.status(500).json({ error: 'Failed to fetch keyword research data' });
    }
  });

  // Export keywords endpoint
  app.post('/api/export-keywords', validateRequest(exportRequestSchema), async (req, res) => {
    const { keywords, format, campaignName, adGroupName } = req.body;

    try {
      let content: string;
      let contentType: string;
      let filename: string;

      switch (format) {
        case 'txt':
          content = keywords.join('\n');
          contentType = 'text/plain';
          filename = 'keywords.txt';
          break;

        case 'csv':
          // RFC4180 CSV format - quote keywords that contain commas or quotes
          const csvKeywords = keywords.map((keyword: string) => {
            if (keyword.includes(',') || keyword.includes('"') || keyword.includes('\n')) {
              return `"${keyword.replace(/"/g, '""')}"`;
            }
            return keyword;
          });
          content = csvKeywords.join('\n');
          contentType = 'text/csv';
          filename = 'keywords.csv';
          break;

        case 'json':
          content = JSON.stringify(keywords, null, 2);
          contentType = 'application/json';
          filename = 'keywords.json';
          break;

        case 'ads-csv':
          // Google Ads CSV format with headers
          const adsRows = keywords.map((keyword: string) => {
            // Quote fields that contain commas or quotes
            const quotedKeyword = keyword.includes(',') || keyword.includes('"') ? 
              `"${keyword.replace(/"/g, '""')}"` : keyword;
            const quotedCampaign = campaignName!.includes(',') || campaignName!.includes('"') ? 
              `"${campaignName!.replace(/"/g, '""')}"` : campaignName!;
            const quotedAdGroup = adGroupName!.includes(',') || adGroupName!.includes('"') ? 
              `"${adGroupName!.replace(/"/g, '""')}"` : adGroupName!;
            
            return `${quotedCampaign},${quotedAdGroup},${quotedKeyword},Broad`;
          });
          content = 'Campaign,Ad group,Keyword,Match type\n' + adsRows.join('\n');
          contentType = 'text/csv';
          filename = 'ads-keywords.csv';
          break;

        default:
          return res.status(400).json({ error: 'Invalid export format' });
      }

      // Set proper headers for file download
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(content, 'utf8'));
      
      // Send the content as a buffer with explicit 200 status
      res.status(200).end(Buffer.from(content, 'utf8'));

    } catch (error) {
      console.error('Error exporting keywords:', error);
      res.status(500).json({ error: 'Failed to export keywords' });
    }
  });

  return server;
}
