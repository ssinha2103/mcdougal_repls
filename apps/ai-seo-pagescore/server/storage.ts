import { analysisJobs, seoMetrics, type AnalysisJob, type InsertAnalysisJob, type SeoMetrics, type InsertSeoMetrics } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createAnalysisJob(job: InsertAnalysisJob): Promise<AnalysisJob>;
  getAnalysisJob(id: number): Promise<AnalysisJob | undefined>;
  updateAnalysisJob(id: number, updates: Partial<AnalysisJob>): Promise<AnalysisJob>;
  createSeoMetrics(metrics: InsertSeoMetrics): Promise<SeoMetrics>;
  getSeoMetricsByJobId(jobId: number): Promise<SeoMetrics[]>;
}

export class DatabaseStorage implements IStorage {
  private async retryOperation<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`Database operation attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }
      }
    }
    
    throw lastError!;
  }

  async createAnalysisJob(insertJob: InsertAnalysisJob): Promise<AnalysisJob> {
    return this.retryOperation(async () => {
      const [job] = await db
        .insert(analysisJobs)
        .values(insertJob)
        .returning();
      return job;
    });
  }

  async getAnalysisJob(id: number): Promise<AnalysisJob | undefined> {
    return this.retryOperation(async () => {
      const [job] = await db.select().from(analysisJobs).where(eq(analysisJobs.id, id));
      return job || undefined;
    });
  }

  async updateAnalysisJob(id: number, updates: Partial<AnalysisJob>): Promise<AnalysisJob> {
    return this.retryOperation(async () => {
      const [job] = await db
        .update(analysisJobs)
        .set(updates)
        .where(eq(analysisJobs.id, id))
        .returning();
      return job;
    });
  }

  async createSeoMetrics(insertMetrics: InsertSeoMetrics): Promise<SeoMetrics> {
    return this.retryOperation(async () => {
      const [metrics] = await db
        .insert(seoMetrics)
        .values(insertMetrics)
        .returning();
      return metrics;
    });
  }

  async getSeoMetricsByJobId(jobId: number): Promise<SeoMetrics[]> {
    return this.retryOperation(async () => {
      return await db.select().from(seoMetrics).where(eq(seoMetrics.analysisJobId, jobId));
    });
  }
}

export class MemStorage implements IStorage {
  private analysisJobs: Map<number, AnalysisJob>;
  private seoMetrics: Map<number, SeoMetrics>;
  private currentAnalysisJobId: number;
  private currentMetricsId: number;

  constructor() {
    this.analysisJobs = new Map();
    this.seoMetrics = new Map();
    this.currentAnalysisJobId = 1;
    this.currentMetricsId = 1;
  }

  async createAnalysisJob(insertJob: InsertAnalysisJob): Promise<AnalysisJob> {
    const id = this.currentAnalysisJobId++;
    const job: AnalysisJob = {
      ...insertJob,
      id,
      results: null,
      status: insertJob.status || "pending",
      progress: insertJob.progress || 0,
      currentStep: insertJob.currentStep || null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.analysisJobs.set(id, job);
    return job;
  }

  async getAnalysisJob(id: number): Promise<AnalysisJob | undefined> {
    return this.analysisJobs.get(id);
  }

  async updateAnalysisJob(id: number, updates: Partial<AnalysisJob>): Promise<AnalysisJob> {
    const job = this.analysisJobs.get(id);
    if (!job) {
      throw new Error(`Analysis job with id ${id} not found`);
    }
    const updatedJob = { ...job, ...updates };
    this.analysisJobs.set(id, updatedJob);
    return updatedJob;
  }

  async createSeoMetrics(insertMetrics: InsertSeoMetrics): Promise<SeoMetrics> {
    const id = this.currentMetricsId++;
    const metrics: SeoMetrics = {
      ...insertMetrics,
      id,
      createdAt: new Date(),
      // Ensure all required fields have default values
      indexedPages: insertMetrics.indexedPages ?? null,
      referringDomains: insertMetrics.referringDomains ?? null,
      backlinks: insertMetrics.backlinks ?? null,
      organicKeywords: insertMetrics.organicKeywords ?? null,
      organicTraffic: insertMetrics.organicTraffic ?? null,
      trafficCost: insertMetrics.trafficCost ?? null,
      top100Keywords: insertMetrics.top100Keywords ?? null,
      keywordPositions: insertMetrics.keywordPositions ?? null,
      competitorGap: insertMetrics.competitorGap ?? null,
      pageSpeed: insertMetrics.pageSpeed ?? null,
      analysisJobId: insertMetrics.analysisJobId ?? null,
      // E-E-A-T signals
      hasAuthorBox: insertMetrics.hasAuthorBox ?? false,
      hasLinkedAuthor: insertMetrics.hasLinkedAuthor ?? false,
      hasStructuredData: insertMetrics.hasStructuredData ?? false,
      structuredContentScore: insertMetrics.structuredContentScore ?? 0,
      experienceSignals: insertMetrics.experienceSignals ?? 0,
      originalMediaCount: insertMetrics.originalMediaCount ?? 0,
      trustSignalsScore: insertMetrics.trustSignalsScore ?? 0,
      // Google Reviews
      googleReviewsCount: insertMetrics.googleReviewsCount ?? null,
      googleRating: insertMetrics.googleRating ?? null,
      // YouTube Analytics
      youtubeChannelUrl: insertMetrics.youtubeChannelUrl ?? null,
      youtubeSubscribers: insertMetrics.youtubeSubscribers ?? null,
      youtubeTotalViews: insertMetrics.youtubeTotalViews ?? null,
      youtubeVideoCount: insertMetrics.youtubeVideoCount ?? null,
      youtubePostingFrequency: insertMetrics.youtubePostingFrequency ?? null,
      youtubeEngagementRate: insertMetrics.youtubeEngagementRate ?? null,
      youtubeChannelAge: insertMetrics.youtubeChannelAge ?? null,
      // Social Media Analytics
      socialMediaClicks: insertMetrics.socialMediaClicks ?? null,
      socialMediaPresence: insertMetrics.socialMediaPresence ?? null,
      socialMediaAnalytics: insertMetrics.socialMediaAnalytics ?? null,
      // Technology Stack
      technologies: insertMetrics.technologies ?? null,
      securityScore: insertMetrics.securityScore ?? 0,
      mobileOptimization: insertMetrics.mobileOptimization ?? false,
      // Competitive Intelligence
      competitiveStrength: insertMetrics.competitiveStrength ?? null,
      contentGaps: insertMetrics.contentGaps ?? null,
      // New DataForSEO calculated metrics
      avgCPC: insertMetrics.avgCPC ?? null,
      top10Coverage: insertMetrics.top10Coverage ?? null,
      top3Keywords: insertMetrics.top3Keywords ?? null,
      top3Percentage: insertMetrics.top3Percentage ?? null,
      visibilityScore: insertMetrics.visibilityScore ?? null,
      newKeywords: insertMetrics.newKeywords ?? null,
      improvedKeywords: insertMetrics.improvedKeywords ?? null,
      declinedKeywords: insertMetrics.declinedKeywords ?? null,
      lostKeywords: insertMetrics.lostKeywords ?? null,
    };
    this.seoMetrics.set(id, metrics);
    return metrics;
  }

  async getSeoMetricsByJobId(jobId: number): Promise<SeoMetrics[]> {
    return Array.from(this.seoMetrics.values()).filter(
      (metrics) => metrics.analysisJobId === jobId
    );
  }
}

export const storage = new DatabaseStorage();
