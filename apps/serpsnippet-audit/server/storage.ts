import { 
  type UrlAnalysis, 
  type InsertUrlAnalysis, 
  type BulkJob, 
  type InsertBulkJob,
  urlAnalyses, 
  bulkJobs 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, inArray } from "drizzle-orm";

export interface IStorage {
  getAnalysis(url: string): Promise<UrlAnalysis | undefined>;
  saveAnalysis(analysis: UrlAnalysis): Promise<UrlAnalysis>;
  getRecentAnalyses(limit?: number): Promise<UrlAnalysis[]>;
  getAllAnalyses(): Promise<UrlAnalysis[]>;
  getAnalysisHistory(url: string): Promise<UrlAnalysis[]>;
  
  // Bulk job methods
  createBulkJob(job: InsertBulkJob): Promise<BulkJob>;
  getBulkJob(jobId: string): Promise<BulkJob | undefined>;
  updateBulkJob(jobId: string, updates: Partial<BulkJob>): Promise<BulkJob>;
  getAnalysesByIds(ids: number[]): Promise<UrlAnalysis[]>;
}

export class DatabaseStorage implements IStorage {
  async getAnalysis(url: string): Promise<UrlAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(urlAnalyses)
      .where(eq(urlAnalyses.url, url))
      .orderBy(desc(urlAnalyses.scrapedAt))
      .limit(1);
    return analysis || undefined;
  }

  async saveAnalysis(analysis: UrlAnalysis): Promise<UrlAnalysis> {
    // Convert UrlAnalysis to InsertUrlAnalysis by omitting auto-generated fields
    const insertData = {
      url: analysis.url,
      title: analysis.title || null,
      metaDescription: analysis.metaDescription || null,
      titleLength: analysis.titleLength || 0,
      descriptionLength: analysis.descriptionLength || 0,
      issues: analysis.issues || [],
      recommendations: analysis.recommendations || []
    };
    
    const [savedAnalysis] = await db
      .insert(urlAnalyses)
      .values(insertData)
      .returning();
    return savedAnalysis;
  }

  async getRecentAnalyses(limit: number = 10): Promise<UrlAnalysis[]> {
    return await db
      .select()
      .from(urlAnalyses)
      .orderBy(desc(urlAnalyses.scrapedAt))
      .limit(limit);
  }

  async getAllAnalyses(): Promise<UrlAnalysis[]> {
    return await db
      .select()
      .from(urlAnalyses)
      .orderBy(desc(urlAnalyses.scrapedAt));
  }

  async getAnalysisHistory(url: string): Promise<UrlAnalysis[]> {
    return await db
      .select()
      .from(urlAnalyses)
      .where(eq(urlAnalyses.url, url))
      .orderBy(desc(urlAnalyses.scrapedAt));
  }

  async createBulkJob(job: InsertBulkJob): Promise<BulkJob> {
    const [created] = await db
      .insert(bulkJobs)
      .values(job)
      .returning();
    return created;
  }

  async getBulkJob(jobId: string): Promise<BulkJob | undefined> {
    const [job] = await db
      .select()
      .from(bulkJobs)
      .where(eq(bulkJobs.id, jobId))
      .limit(1);
    return job || undefined;
  }

  async updateBulkJob(jobId: string, updates: Partial<BulkJob>): Promise<BulkJob> {
    const [updated] = await db
      .update(bulkJobs)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(bulkJobs.id, jobId))
      .returning();
    return updated;
  }

  async getAnalysesByIds(ids: number[]): Promise<UrlAnalysis[]> {
    if (ids.length === 0) return [];
    return await db
      .select()
      .from(urlAnalyses)
      .where(inArray(urlAnalyses.id, ids))
      .orderBy(desc(urlAnalyses.scrapedAt));
  }
}

export const storage = new DatabaseStorage();
