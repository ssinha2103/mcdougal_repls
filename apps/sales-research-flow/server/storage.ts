import {
  type Job,
  type InsertJob,
  type Domain,
  type InsertDomain,
  type FailedDomain,
  type InsertFailedDomain,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Jobs
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: string): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined>;

  // Domains
  createDomain(domain: InsertDomain): Promise<Domain>;
  getDomainById(id: string): Promise<Domain | undefined>;
  getDomainsByJobId(jobId: string): Promise<Domain[]>;
  updateDomain(id: string, updates: Partial<Domain>): Promise<Domain | undefined>;

  // Failed Domains
  createFailedDomain(failedDomain: InsertFailedDomain): Promise<FailedDomain>;
  getFailedDomainsByJobId(jobId: string): Promise<FailedDomain[]>;
}

export class MemStorage implements IStorage {
  private jobs: Map<string, Job>;
  private domains: Map<string, Domain>;
  private failedDomains: Map<string, FailedDomain>;

  constructor() {
    this.jobs = new Map();
    this.domains = new Map();
    this.failedDomains = new Map();
  }

  // Jobs
  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      id,
      filename: insertJob.filename,
      totalDomains: insertJob.totalDomains,
      processedDomains: insertJob.processedDomains || 0,
      failedDomains: insertJob.failedDomains || 0,
      status: insertJob.status || "pending",
      createdAt: new Date(),
      completedAt: null,
    };
    this.jobs.set(id, job);
    return job;
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | undefined> {
    const job = this.jobs.get(id);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  // Domains
  async createDomain(insertDomain: InsertDomain): Promise<Domain> {
    const id = randomUUID();
    const domain: Domain = {
      id,
      createdAt: new Date(),
      jobId: insertDomain.jobId,
      companyName: insertDomain.companyName,
      webAddress: insertDomain.webAddress,
      category: insertDomain.category || "Unknown",
      organicTraffic: insertDomain.organicTraffic || null,
      keywordsTop100: insertDomain.keywordsTop100 || null,
      trafficValue: insertDomain.trafficValue || null,
      trafficTrend3mo: insertDomain.trafficTrend3mo || null,
      pagesIndexed: insertDomain.pagesIndexed || null,
      urgencyFlag: insertDomain.urgencyFlag || null,
      dataSource: insertDomain.dataSource || null,
      performanceScore: insertDomain.performanceScore || null,
      mobileScore: insertDomain.mobileScore || null,
      desktopScore: insertDomain.desktopScore || null,
      fcp: insertDomain.fcp || null,
      lcp: insertDomain.lcp || null,
      fid: insertDomain.fid || null,
      cls: insertDomain.cls || null,
      lastPerformanceCheck: insertDomain.lastPerformanceCheck || null,
      aiOverviewPresent: insertDomain.aiOverviewPresent || null,
      aiOverviewMentioned: insertDomain.aiOverviewMentioned || null,
      aiOverviewVisibilityScore: insertDomain.aiOverviewVisibilityScore || null,
      priorityScore: insertDomain.priorityScore || null,
      error: insertDomain.error || null,
    };
    this.domains.set(id, domain);
    return domain;
  }

  async getDomainById(id: string): Promise<Domain | undefined> {
    return this.domains.get(id);
  }

  async getDomainsByJobId(jobId: string): Promise<Domain[]> {
    return Array.from(this.domains.values()).filter(
      (domain) => domain.jobId === jobId
    );
  }

  async updateDomain(
    id: string,
    updates: Partial<Domain>
  ): Promise<Domain | undefined> {
    const domain = this.domains.get(id);
    if (!domain) return undefined;

    const updatedDomain = { ...domain, ...updates };
    this.domains.set(id, updatedDomain);
    return updatedDomain;
  }

  // Failed Domains
  async createFailedDomain(
    insertFailedDomain: InsertFailedDomain
  ): Promise<FailedDomain> {
    const id = randomUUID();
    const failedDomain: FailedDomain = {
      ...insertFailedDomain,
      id,
      createdAt: new Date(),
    };
    this.failedDomains.set(id, failedDomain);
    return failedDomain;
  }

  async getFailedDomainsByJobId(jobId: string): Promise<FailedDomain[]> {
    return Array.from(this.failedDomains.values()).filter(
      (fd) => fd.jobId === jobId
    );
  }
}

export const storage = new MemStorage();
