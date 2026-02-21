// Reference: javascript_database blueprint - Database storage implementation
import {
  domains,
  runs,
  snapshots,
  sections,
  metrics,
  insights,
  crawlerLogs,
  scheduledRuns,
  type Domain,
  type InsertDomain,
  type Run,
  type InsertRun,
  type Snapshot,
  type InsertSnapshot,
  type Section,
  type InsertSection,
  type Metrics,
  type InsertMetrics,
  type Insight,
  type InsertInsight,
  type InsertCrawlerLog,
  type ScheduledRun,
  type InsertScheduledRun,
  type DomainWithMetrics,
  type RunWithProgress,
  type SnapshotWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export interface IStorage {
  // Domains
  getDomain(id: string): Promise<Domain | undefined>;
  getDomainByName(domain: string): Promise<Domain | undefined>;
  getAllDomains(): Promise<DomainWithMetrics[]>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomainStatus(id: string, status: string, lastCrawledAt?: Date): Promise<void>;
  
  // Runs
  getRun(id: string): Promise<Run | undefined>;
  getAllRuns(): Promise<RunWithProgress[]>;
  createRun(run: InsertRun): Promise<Run>;
  updateRunStatus(id: string, status: string): Promise<void>;
  updateRunProgress(id: string, completed: number, failed: number): Promise<void>;
  
  // Snapshots
  getSnapshot(id: string): Promise<SnapshotWithDetails | undefined>;
  getSnapshotsByRun(runId: string): Promise<Snapshot[]>;
  createSnapshot(snapshot: InsertSnapshot): Promise<Snapshot>;
  updateSnapshotStatus(id: string, status: string, errorMessage?: string): Promise<void>;
  
  // Sections
  getSectionsBySnapshot(snapshotId: string): Promise<Section[]>;
  createSection(section: InsertSection): Promise<Section>;
  
  // Metrics
  getMetricsBySnapshot(snapshotId: string): Promise<Metrics | undefined>;
  createMetrics(m: InsertMetrics): Promise<Metrics>;
  
  // Insights
  getInsightsBySnapshot(snapshotId: string): Promise<Insight[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  
  // Crawler logs
  createLog(log: InsertCrawlerLog): Promise<void>;
  getLogsByRun(runId: string): Promise<any[]>;
  
  // Scheduled Runs
  getScheduledRun(id: string): Promise<ScheduledRun | undefined>;
  getAllScheduledRuns(): Promise<ScheduledRun[]>;
  getEnabledScheduledRuns(): Promise<ScheduledRun[]>;
  createScheduledRun(scheduledRun: InsertScheduledRun): Promise<ScheduledRun>;
  updateScheduledRun(id: string, updates: Partial<InsertScheduledRun>): Promise<void>;
  updateScheduledRunTimestamps(id: string, lastRunAt: Date, nextRunAt: Date): Promise<void>;
  toggleScheduledRun(id: string, enabled: boolean): Promise<void>;
  deleteScheduledRun(id: string): Promise<void>;
  countRunsToday(scheduledRunId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // Domains
  async getDomain(id: string): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain || undefined;
  }

  async getDomainByName(domain: string): Promise<Domain | undefined> {
    const [result] = await db.select().from(domains).where(eq(domains.domain, domain));
    return result || undefined;
  }

  async getAllDomains(): Promise<DomainWithMetrics[]> {
    const allDomains = await db.select().from(domains).orderBy(desc(domains.createdAt));

    // Fetch latest snapshot with metrics for each domain
    const domainsWithMetrics = await Promise.all(
      allDomains.map(async (domain) => {
        const [latestSnapshot] = await db
          .select()
          .from(snapshots)
          .where(eq(snapshots.domainId, domain.id))
          .orderBy(desc(snapshots.createdAt))
          .limit(1);

        if (!latestSnapshot) {
          return { ...domain, latestSnapshot: undefined };
        }

        const [snapshotMetrics] = await db
          .select()
          .from(metrics)
          .where(eq(metrics.snapshotId, latestSnapshot.id));

        const snapshotInsights = await db
          .select()
          .from(insights)
          .where(eq(insights.snapshotId, latestSnapshot.id));

        return {
          ...domain,
          latestSnapshot: {
            ...latestSnapshot,
            metrics: snapshotMetrics,
            insights: snapshotInsights,
          },
        };
      })
    );

    return domainsWithMetrics;
  }

  async createDomain(insertDomain: InsertDomain): Promise<Domain> {
    const [domain] = await db.insert(domains).values(insertDomain).returning();
    return domain;
  }

  async updateDomainStatus(id: string, status: string, lastCrawledAt?: Date): Promise<void> {
    await db
      .update(domains)
      .set({ status, lastCrawledAt: lastCrawledAt || new Date() })
      .where(eq(domains.id, id));
  }

  // Runs
  async getRun(id: string): Promise<Run | undefined> {
    const [run] = await db.select().from(runs).where(eq(runs.id, id));
    return run || undefined;
  }

  async getAllRuns(): Promise<RunWithProgress[]> {
    const allRuns = await db.select().from(runs).orderBy(desc(runs.createdAt));
    return allRuns as RunWithProgress[];
  }

  async createRun(insertRun: InsertRun): Promise<Run> {
    const [run] = await db.insert(runs).values(insertRun).returning();
    return run;
  }

  async updateRunStatus(id: string, status: string): Promise<void> {
    const updates: any = { status };
    if (status === "running" && !updates.startedAt) {
      updates.startedAt = new Date();
    }
    if (status === "completed" || status === "failed" || status === "cancelled") {
      updates.completedAt = new Date();
    }
    await db.update(runs).set(updates).where(eq(runs.id, id));
  }

  async updateRunProgress(id: string, completed: number, failed: number): Promise<void> {
    await db
      .update(runs)
      .set({ completedDomains: completed, failedDomains: failed })
      .where(eq(runs.id, id));
  }

  // Snapshots
  async getSnapshot(id: string): Promise<SnapshotWithDetails | undefined> {
    const [snapshot] = await db.select().from(snapshots).where(eq(snapshots.id, id));
    if (!snapshot) return undefined;

    const [domain] = await db.select().from(domains).where(eq(domains.id, snapshot.domainId));
    const snapshotSections = await this.getSectionsBySnapshot(id);
    const snapshotMetrics = await this.getMetricsBySnapshot(id);
    const snapshotInsights = await this.getInsightsBySnapshot(id);

    return {
      ...snapshot,
      domain,
      sections: snapshotSections,
      metrics: snapshotMetrics,
      insights: snapshotInsights,
    };
  }

  async getSnapshotsByRun(runId: string): Promise<Snapshot[]> {
    return await db.select().from(snapshots).where(eq(snapshots.runId, runId));
  }

  async createSnapshot(insertSnapshot: InsertSnapshot): Promise<Snapshot> {
    const [snapshot] = await db.insert(snapshots).values(insertSnapshot).returning();
    return snapshot;
  }

  async updateSnapshotStatus(id: string, status: string, errorMessage?: string): Promise<void> {
    const updates: any = { status };
    if (errorMessage) {
      updates.errorMessage = errorMessage;
    }
    if (status === "pending") {
      updates.startedAt = new Date();
    }
    if (status === "completed" || status === "failed") {
      updates.completedAt = new Date();
    }
    await db.update(snapshots).set(updates).where(eq(snapshots.id, id));
  }

  // Sections
  async getSectionsBySnapshot(snapshotId: string): Promise<Section[]> {
    return await db.select().from(sections).where(eq(sections.snapshotId, snapshotId));
  }

  async createSection(insertSection: InsertSection): Promise<Section> {
    const [section] = await db.insert(sections).values(insertSection).returning();
    return section;
  }

  // Metrics
  async getMetricsBySnapshot(snapshotId: string): Promise<Metrics | undefined> {
    const [result] = await db.select().from(metrics).where(eq(metrics.snapshotId, snapshotId));
    return result || undefined;
  }

  async createMetrics(insertMetrics: InsertMetrics): Promise<Metrics> {
    const [result] = await db.insert(metrics).values(insertMetrics).returning();
    return result;
  }

  // Insights
  async getInsightsBySnapshot(snapshotId: string): Promise<Insight[]> {
    return await db.select().from(insights).where(eq(insights.snapshotId, snapshotId));
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const [insight] = await db.insert(insights).values(insertInsight).returning();
    return insight;
  }

  // Crawler logs
  async createLog(insertLog: InsertCrawlerLog): Promise<void> {
    await db.insert(crawlerLogs).values(insertLog);
  }

  async getLogsByRun(runId: string): Promise<any[]> {
    return await db
      .select()
      .from(crawlerLogs)
      .where(eq(crawlerLogs.runId, runId))
      .orderBy(desc(crawlerLogs.createdAt));
  }

  // Scheduled Runs
  async getScheduledRun(id: string): Promise<ScheduledRun | undefined> {
    const [scheduledRun] = await db.select().from(scheduledRuns).where(eq(scheduledRuns.id, id));
    return scheduledRun || undefined;
  }

  async getAllScheduledRuns(): Promise<ScheduledRun[]> {
    return await db.select().from(scheduledRuns).orderBy(desc(scheduledRuns.createdAt));
  }

  async getEnabledScheduledRuns(): Promise<ScheduledRun[]> {
    return await db.select().from(scheduledRuns).where(eq(scheduledRuns.enabled, true));
  }

  async createScheduledRun(insertScheduledRun: InsertScheduledRun): Promise<ScheduledRun> {
    const [scheduledRun] = await db.insert(scheduledRuns).values(insertScheduledRun).returning();
    return scheduledRun;
  }

  async updateScheduledRun(id: string, updates: Partial<InsertScheduledRun>): Promise<void> {
    await db
      .update(scheduledRuns)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(scheduledRuns.id, id));
  }

  async updateScheduledRunTimestamps(id: string, lastRunAt: Date, nextRunAt: Date): Promise<void> {
    await db
      .update(scheduledRuns)
      .set({ lastRunAt, nextRunAt, updatedAt: new Date() })
      .where(eq(scheduledRuns.id, id));
  }

  async toggleScheduledRun(id: string, enabled: boolean): Promise<void> {
    await db
      .update(scheduledRuns)
      .set({ enabled, updatedAt: new Date() })
      .where(eq(scheduledRuns.id, id));
  }

  async deleteScheduledRun(id: string): Promise<void> {
    await db.delete(scheduledRuns).where(eq(scheduledRuns.id, id));
  }

  async countRunsToday(scheduledRunId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const runsToday = await db
      .select()
      .from(runs)
      .where(
        and(
          sql`${runs.config}->>'scheduledRunId' = ${scheduledRunId}`,
          gte(runs.createdAt, today)
        )
      );
    
    return runsToday.length;
  }
}

export const storage = new DatabaseStorage();
