import { db } from "./db";
import { savedAnalyses, type SavedAnalysis, type InsertSavedAnalysis } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

// Custom error classes for better error handling
export class DatabaseError extends Error {
  constructor(message: string, public code?: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, 'CONNECTION_ERROR', originalError);
    this.name = 'ConnectionError';
  }
}

export class ConstraintViolationError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, 'CONSTRAINT_VIOLATION', originalError);
    this.name = 'ConstraintViolationError';
  }
}

export interface IStorage {
  getRecentAnalyses(limit: number, offset: number): Promise<{ analyses: SavedAnalysis[]; total: number }>;
  deleteAnalysisById(id: string): Promise<boolean>;
  healthCheck(): Promise<boolean>;
}

export class DBStorage implements IStorage {
  private retryCount = 3;
  private retryDelay = 1000; // milliseconds

  private async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a connection error that should be retried
        if (this.isRetriableError(error)) {
          if (attempt < this.retryCount) {
            console.log(`[Storage] ${operationName} failed (attempt ${attempt}/${this.retryCount}), retrying in ${this.retryDelay}ms...`);
            await this.sleep(this.retryDelay * attempt);
            continue;
          }
        }
        
        // Non-retriable error or max retries reached
        throw this.wrapError(error, operationName);
      }
    }
    
    throw this.wrapError(lastError, operationName);
  }

  private isRetriableError(error: any): boolean {
    const errorMessage = error?.message || error?.toString() || '';
    
    // Connection errors
    if (errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('connection')) {
      return true;
    }
    
    // Database is locked (SQLite specific)
    if (errorMessage.includes('database is locked') ||
        errorMessage.includes('SQLITE_BUSY')) {
      return true;
    }
    
    // Deadlock errors
    if (errorMessage.includes('deadlock')) {
      return true;
    }
    
    return false;
  }

  private wrapError(error: any, operation: string): DatabaseError {
    const errorMessage = error?.message || error?.toString() || 'Unknown database error';
    
    // Connection errors
    if (this.isRetriableError(error)) {
      return new ConnectionError(
        `Database connection failed during ${operation}: ${errorMessage}`,
        error
      );
    }
    
    // Constraint violations
    if (errorMessage.includes('constraint') ||
        errorMessage.includes('duplicate') ||
        errorMessage.includes('unique') ||
        errorMessage.includes('foreign key')) {
      return new ConstraintViolationError(
        `Data constraint violation during ${operation}: ${errorMessage}`,
        error
      );
    }
    
    // Generic database error
    return new DatabaseError(
      `Database operation failed during ${operation}: ${errorMessage}`,
      'DATABASE_ERROR',
      error
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getRecentAnalyses(limit: number = 10, offset: number = 0): Promise<{ analyses: SavedAnalysis[]; total: number }> {
    if (limit < 1 || limit > 100) {
      throw new DatabaseError('Limit must be between 1 and 100', 'VALIDATION_ERROR');
    }
    
    if (offset < 0) {
      throw new DatabaseError('Offset must be non-negative', 'VALIDATION_ERROR');
    }
    
    return this.withRetry(async () => {
      try {
        // Get total count
        const countResult = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(savedAnalyses);
        
        const total = Number(countResult[0]?.count || 0);
        
        // Get paginated results
        const analyses = await db
          .select()
          .from(savedAnalyses)
          .orderBy(desc(savedAnalyses.createdAt))
          .limit(limit)
          .offset(offset);
        
        console.log(`[Storage] Retrieved ${analyses.length} recent analyses (total: ${total})`);
        
        return { analyses, total };
      } catch (error: any) {
        throw error;
      }
    }, 'getRecentAnalyses');
  }

  async deleteAnalysisById(id: string): Promise<boolean> {
    if (!id) {
      throw new DatabaseError('ID is required for deleting analysis', 'VALIDATION_ERROR');
    }
    
    return this.withRetry(async () => {
      try {
        const result = await db
          .delete(savedAnalyses)
          .where(eq(savedAnalyses.id, id))
          .returning({ id: savedAnalyses.id });
        
        const deleted = result.length > 0;
        
        if (deleted) {
          console.log(`[Storage] Deleted analysis with ID: ${id}`);
        } else {
          console.log(`[Storage] No analysis found to delete with ID: ${id}`);
        }
        
        return deleted;
      } catch (error: any) {
        throw error;
      }
    }, 'deleteAnalysisById');
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple query to check database connectivity
      const result = await db.execute(sql`SELECT 1 as health`);
      
      console.log('[Storage] Database health check passed');
      return true;
    } catch (error: any) {
      console.error('[Storage] Database health check failed:', error.message);
      return false;
    }
  }

  // Cleanup old analyses (older than 30 days)
  async cleanupOldAnalyses(): Promise<number> {
    return this.withRetry(async () => {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const result = await db
          .delete(savedAnalyses)
          .where(sql`${savedAnalyses.createdAt} < ${thirtyDaysAgo}`)
          .returning({ id: savedAnalyses.id });
        
        const count = result.length;
        
        if (count > 0) {
          console.log(`[Storage] Cleaned up ${count} old analyses`);
        }
        
        return count;
      } catch (error: any) {
        throw error;
      }
    }, 'cleanupOldAnalyses');
  }
}

// Singleton instance with connection pooling handled by Drizzle
export const storage = new DBStorage();

// Database health monitoring
if (process.env.NODE_ENV === 'production') {
  // Check database health every 5 minutes
  setInterval(async () => {
    const isHealthy = await storage.healthCheck();
    if (!isHealthy) {
      console.error('[Storage] Database health check failed - connection may be lost');
    }
  }, 5 * 60 * 1000);
  
  // Cleanup old data daily
  setInterval(async () => {
    try {
      const cleaned = await storage.cleanupOldAnalyses();
      if (cleaned > 0) {
        console.log(`[Storage] Daily cleanup completed: ${cleaned} old records removed`);
      }
    } catch (error) {
      console.error('[Storage] Daily cleanup failed:', error);
    }
  }, 24 * 60 * 60 * 1000);
}