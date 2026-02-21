import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  napChecks,
  directoryResults,
  batchChecks,
  type NAPCheck,
  type InsertNAPCheck,
  type DirectoryResultRow,
  type InsertDirectoryResult,
  type BatchCheck,
  type InsertBatchCheck,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // NAP Check operations
  createNAPCheck(check: InsertNAPCheck): Promise<NAPCheck>;
  createNAPCheckWithResults(check: InsertNAPCheck, results: InsertDirectoryResult[]): Promise<NAPCheck>;
  getNAPCheck(id: number): Promise<NAPCheck | undefined>;
  getAllNAPChecks(limit?: number): Promise<NAPCheck[]>;
  getNAPChecksByFirm(firmName: string): Promise<NAPCheck[]>;
  
  // Directory Result operations
  createDirectoryResults(results: InsertDirectoryResult[]): Promise<DirectoryResultRow[]>;
  getDirectoryResultsByCheckId(checkId: number): Promise<DirectoryResultRow[]>;
  
  // Batch Check operations
  createBatchCheck(batch: InsertBatchCheck): Promise<BatchCheck>;
  getBatchCheck(id: number): Promise<BatchCheck | undefined>;
  updateBatchCheck(id: number, updates: Partial<InsertBatchCheck>): Promise<BatchCheck>;
  getAllBatchChecks(): Promise<BatchCheck[]>;
}

export class DatabaseStorage implements IStorage {
  private db;

  constructor() {
    const sql = neon(process.env.DATABASE_URL!);
    this.db = drizzle(sql);
  }

  async createNAPCheck(check: InsertNAPCheck): Promise<NAPCheck> {
    const [result] = await this.db.insert(napChecks).values(check).returning();
    return result;
  }

  async createNAPCheckWithResults(check: InsertNAPCheck, results: InsertDirectoryResult[]): Promise<NAPCheck> {
    const savedCheck = await this.createNAPCheck(check);
    
    const resultsWithCheckId = results.map(result => ({
      ...result,
      checkId: savedCheck.id,
    }));
    
    if (resultsWithCheckId.length > 0) {
      await this.createDirectoryResults(resultsWithCheckId);
    }
    
    return savedCheck;
  }

  async getNAPCheck(id: number): Promise<NAPCheck | undefined> {
    const [result] = await this.db
      .select()
      .from(napChecks)
      .where(eq(napChecks.id, id))
      .limit(1);
    return result;
  }

  async getAllNAPChecks(limit: number = 50): Promise<NAPCheck[]> {
    return await this.db
      .select()
      .from(napChecks)
      .orderBy(desc(napChecks.checkedAt))
      .limit(limit);
  }

  async getNAPChecksByFirm(firmName: string): Promise<NAPCheck[]> {
    return await this.db
      .select()
      .from(napChecks)
      .where(eq(napChecks.firmName, firmName))
      .orderBy(desc(napChecks.checkedAt));
  }

  async createDirectoryResults(results: InsertDirectoryResult[]): Promise<DirectoryResultRow[]> {
    if (results.length === 0) return [];
    return await this.db.insert(directoryResults).values(results).returning();
  }

  async getDirectoryResultsByCheckId(checkId: number): Promise<DirectoryResultRow[]> {
    return await this.db
      .select()
      .from(directoryResults)
      .where(eq(directoryResults.checkId, checkId));
  }

  async createBatchCheck(batch: InsertBatchCheck): Promise<BatchCheck> {
    const [result] = await this.db.insert(batchChecks).values(batch).returning();
    return result;
  }

  async getBatchCheck(id: number): Promise<BatchCheck | undefined> {
    const [result] = await this.db
      .select()
      .from(batchChecks)
      .where(eq(batchChecks.id, id))
      .limit(1);
    return result;
  }

  async updateBatchCheck(id: number, updates: Partial<InsertBatchCheck>): Promise<BatchCheck> {
    const [result] = await this.db
      .update(batchChecks)
      .set(updates)
      .where(eq(batchChecks.id, id))
      .returning();
    return result;
  }

  async getAllBatchChecks(): Promise<BatchCheck[]> {
    return await this.db
      .select()
      .from(batchChecks)
      .orderBy(desc(batchChecks.createdAt));
  }
}

export const storage = new DatabaseStorage();
