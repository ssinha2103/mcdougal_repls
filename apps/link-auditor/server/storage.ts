import { db } from "./db";
import { scans, type InsertScan, type Scan } from "@shared/schema";
import { desc, eq } from "drizzle-orm";

export interface IStorage {
  createScan(scan: InsertScan): Promise<Scan>;
  getScans(limit?: number): Promise<Scan[]>;
  getScanById(id: number): Promise<Scan | undefined>;
}

export class DbStorage implements IStorage {
  async createScan(scan: InsertScan): Promise<Scan> {
    const [result] = await db.insert(scans).values(scan).returning();
    return result;
  }

  async getScans(limit: number = 50): Promise<Scan[]> {
    return await db.select().from(scans).orderBy(desc(scans.createdAt)).limit(limit);
  }

  async getScanById(id: number): Promise<Scan | undefined> {
    const [result] = await db.select().from(scans).where(eq(scans.id, id));
    return result;
  }
}

export const storage = new DbStorage();
