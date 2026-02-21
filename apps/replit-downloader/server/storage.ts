import { downloads, type Download, type InsertDownload } from "@shared/schema";
import { db } from "./db";
import { desc } from "drizzle-orm";

export interface IStorage {
  createDownload(download: InsertDownload): Promise<Download>;
  getRecentDownloads(limit?: number): Promise<Download[]>;
}

export class DatabaseStorage implements IStorage {
  async createDownload(download: InsertDownload): Promise<Download> {
    const [result] = await db.insert(downloads).values(download).returning();
    return result;
  }

  async getRecentDownloads(limit = 20): Promise<Download[]> {
    return db.select().from(downloads).orderBy(desc(downloads.downloadedAt)).limit(limit);
  }
}

export const storage = new DatabaseStorage();
