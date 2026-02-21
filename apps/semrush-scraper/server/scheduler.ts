import cron, { type ScheduledTask } from "node-cron";
import { storage } from "./storage";
import { SEMrushCrawler, type CrawlerConfig } from "./crawler";
import { processCrawlResults } from "./gemini";
import type { ScheduledRun } from "@shared/schema";

interface CronJob {
  task: ScheduledTask;
  scheduledRunId: string;
}

const activeCronJobs = new Map<string, CronJob>();

/**
 * Check if current time is within cooldown window
 */
function isInCooldownWindow(cooldownStart: string | null, cooldownEnd: string | null): boolean {
  if (!cooldownStart || !cooldownEnd) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [startHour, startMin] = cooldownStart.split(":").map(Number);
  const [endHour, endMin] = cooldownEnd.split(":").map(Number);

  const cooldownStartMinutes = startHour * 60 + startMin;
  const cooldownEndMinutes = endHour * 60 + endMin;

  // Handle cooldown window crossing midnight
  if (cooldownStartMinutes > cooldownEndMinutes) {
    // Cooldown crosses midnight (e.g., 22:00 to 06:00)
    return currentTime >= cooldownStartMinutes || currentTime < cooldownEndMinutes;
  } else {
    // Normal cooldown window (e.g., 01:00 to 05:00)
    return currentTime >= cooldownStartMinutes && currentTime < cooldownEndMinutes;
  }
}

/**
 * Calculate next run time based on cron schedule
 */
function getNextRunTime(cronSchedule: string): Date {
  const now = new Date();
  const interval = cron.validate(cronSchedule) ? cron.getTasks().get(cronSchedule) : null;
  
  // Simple approximation - add 1 day for daily schedules
  // In production, you'd use a library like cron-parser for accurate calculation
  const nextRun = new Date(now);
  
  // Parse common patterns
  if (cronSchedule.startsWith("0 ")) {
    // Daily pattern like "0 2 * * *" (2 AM daily)
    const parts = cronSchedule.split(" ");
    const hour = parseInt(parts[1]);
    
    nextRun.setHours(hour, 0, 0, 0);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
  } else {
    // Default: add 1 hour
    nextRun.setHours(nextRun.getHours() + 1);
  }
  
  return nextRun;
}

/**
 * Execute a scheduled crawl
 */
async function executeScheduledCrawl(scheduledRun: ScheduledRun): Promise<void> {
  console.log(`[SCHEDULER] Executing scheduled run: ${scheduledRun.name} (${scheduledRun.id})`);

  try {
    // Check if in cooldown window
    if (isInCooldownWindow(scheduledRun.cooldownStart, scheduledRun.cooldownEnd)) {
      console.log(`[SCHEDULER] Skipping ${scheduledRun.name} - in cooldown window`);
      return;
    }

    // Check daily cap
    const runsToday = await storage.countRunsToday(scheduledRun.id);
    if (runsToday >= scheduledRun.dailyCap) {
      console.log(`[SCHEDULER] Skipping ${scheduledRun.name} - daily cap reached (${runsToday}/${scheduledRun.dailyCap})`);
      return;
    }

    // Get crawler config from scheduled run
    const config: CrawlerConfig = scheduledRun.config as CrawlerConfig || {
      database: "us",
      maxRequestsPerHour: 120,
      enableAI: true,
    };
    
    // Auto-enable development mode in dev environment
    if (process.env.NODE_ENV === "development") {
      config.developmentMode = true;
    }

    // Create run
    const run = await storage.createRun({
      name: `${scheduledRun.name} - ${new Date().toLocaleString()}`,
      database: config.database,
      totalDomains: scheduledRun.domains.length,
      completedDomains: 0,
      failedDomains: 0,
      status: "pending",
      config: {
        ...config,
        scheduledRunId: scheduledRun.id,
      },
    });

    console.log(`[SCHEDULER] Created run ${run.id} for scheduled run ${scheduledRun.name}`);

    // Create or update domains
    const createdDomains = await Promise.all(
      scheduledRun.domains.map(async (domainName: string) => {
        const existing = await storage.getDomainByName(domainName);
        if (existing) {
          await storage.updateDomainStatus(existing.id, "queued");
          return existing;
        }
        return await storage.createDomain({
          domain: domainName,
          status: "queued",
        });
      })
    );

    // Create snapshots
    await Promise.all(
      createdDomains.map((domain) =>
        storage.createSnapshot({
          domainId: domain.id,
          runId: run.id,
          status: "pending",
        })
      )
    );

    // Update run status
    await storage.updateRunStatus(run.id, "running");

    // Initialize crawler
    const crawler = new SEMrushCrawler(config);
    await crawler.initialize();

    let completed = 0;
    let failed = 0;

    // Crawl each domain
    for (const domain of createdDomains) {
      try {
        await storage.updateDomainStatus(domain.id, "crawling");

        const snapshots = await storage.getSnapshotsByRun(run.id);
        const snapshot = snapshots.find((s) => s.domainId === domain.id);

        if (!snapshot) {
          console.error(`[SCHEDULER] No snapshot found for domain ${domain.domain}`);
          failed++;
          continue;
        }

        await storage.updateSnapshotStatus(snapshot.id, "pending");

        // Crawl domain
        const result = await crawler.crawlDomain(domain.domain, run.id);

        if (result.success) {
          // Save sections
          await Promise.all(
            result.sections.map((section) =>
              storage.createSection({
                snapshotId: snapshot.id,
                sectionType: section.sectionType,
                screenshotPath: section.screenshotPath,
                extractedData: section.extractedData,
                extractionMethod: section.extractionMethod,
                notes: section.notes,
              })
            )
          );

          // Process with AI if enabled
          if (config.enableAI) {
            const { metrics, insights } = await processCrawlResults(result.sections, true, domain.domain);
            
            // Save metrics and insights
            await storage.createMetrics({
              snapshotId: snapshot.id,
              ...metrics,
            });

            for (const insight of insights) {
              if (insight.insightType && insight.title && insight.summary) {
                await storage.createInsight({
                  snapshotId: snapshot.id,
                  insightType: insight.insightType,
                  title: insight.title,
                  summary: insight.summary,
                  details: insight.details,
                  severity: insight.severity,
                  confidence: insight.confidence,
                });
              }
            }
          }

          await storage.updateSnapshotStatus(snapshot.id, "completed");
          await storage.updateDomainStatus(domain.id, "completed", new Date());
          completed++;
        } else {
          await storage.updateSnapshotStatus(snapshot.id, "failed", result.error);
          await storage.updateDomainStatus(domain.id, "failed");
          failed++;
        }
      } catch (error: any) {
        console.error(`[SCHEDULER] Error crawling ${domain.domain}:`, error);
        await storage.updateDomainStatus(domain.id, "failed");
        failed++;
      }

      await storage.updateRunProgress(run.id, completed, failed);
    }

    await crawler.close();
    await storage.updateRunStatus(run.id, "completed");

    // Update scheduled run timestamps
    const nextRunAt = getNextRunTime(scheduledRun.cronSchedule);
    await storage.updateScheduledRunTimestamps(scheduledRun.id, new Date(), nextRunAt);

    console.log(`[SCHEDULER] Completed scheduled run ${scheduledRun.name}: ${completed} succeeded, ${failed} failed`);
  } catch (error: any) {
    console.error(`[SCHEDULER] Error executing scheduled run ${scheduledRun.name}:`, error);
    
    await storage.createLog({
      runId: undefined,
      snapshotId: undefined,
      level: "error",
      message: `Scheduled run ${scheduledRun.name} failed: ${error.message}`,
      metadata: { scheduledRunId: scheduledRun.id, error: error.stack },
    });
  }
}

/**
 * Schedule a single scheduled run
 */
export function scheduleRun(scheduledRun: ScheduledRun): void {
  // Cancel existing job if any
  cancelScheduledRun(scheduledRun.id);

  // Validate cron expression
  if (!cron.validate(scheduledRun.cronSchedule)) {
    console.error(`[SCHEDULER] Invalid cron schedule for ${scheduledRun.name}: ${scheduledRun.cronSchedule}`);
    return;
  }

  console.log(`[SCHEDULER] Scheduling run: ${scheduledRun.name} with schedule ${scheduledRun.cronSchedule}`);

  const task = cron.schedule(scheduledRun.cronSchedule, async () => {
    await executeScheduledCrawl(scheduledRun);
  });

  activeCronJobs.set(scheduledRun.id, {
    task,
    scheduledRunId: scheduledRun.id,
  });

  // Calculate and store next run time
  const nextRunAt = getNextRunTime(scheduledRun.cronSchedule);
  storage.updateScheduledRunTimestamps(scheduledRun.id, scheduledRun.lastRunAt || new Date(), nextRunAt);
}

/**
 * Cancel a scheduled run
 */
export function cancelScheduledRun(scheduledRunId: string): void {
  const existingJob = activeCronJobs.get(scheduledRunId);
  if (existingJob) {
    existingJob.task.stop();
    activeCronJobs.delete(scheduledRunId);
    console.log(`[SCHEDULER] Cancelled scheduled run: ${scheduledRunId}`);
  }
}

/**
 * Manually trigger a scheduled run (ignoring cooldown and daily cap)
 */
export async function runNow(scheduledRunId: string): Promise<void> {
  const scheduledRun = await storage.getScheduledRun(scheduledRunId);
  if (!scheduledRun) {
    throw new Error("Scheduled run not found");
  }

  console.log(`[SCHEDULER] Manually triggering scheduled run: ${scheduledRun.name}`);
  await executeScheduledCrawl(scheduledRun);
}

/**
 * Initialize scheduler - load all enabled scheduled runs
 */
export async function initializeScheduler(): Promise<void> {
  console.log("[SCHEDULER] Initializing scheduler...");

  try {
    const enabledRuns = await storage.getEnabledScheduledRuns();
    console.log(`[SCHEDULER] Found ${enabledRuns.length} enabled scheduled runs`);

    for (const scheduledRun of enabledRuns) {
      scheduleRun(scheduledRun);
    }

    console.log("[SCHEDULER] Scheduler initialized successfully");
  } catch (error: any) {
    console.error("[SCHEDULER] Failed to initialize scheduler:", error);
  }
}

/**
 * Get list of active cron jobs
 */
export function getActiveJobs(): string[] {
  return Array.from(activeCronJobs.keys());
}
