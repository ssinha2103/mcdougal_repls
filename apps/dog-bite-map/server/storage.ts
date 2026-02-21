import { type User, type InsertUser, type BiteReport, type InsertBiteReport } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createBiteReport(report: InsertBiteReport): Promise<BiteReport>;
  getBiteReports(): Promise<BiteReport[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private biteReports: Map<string, BiteReport>;

  constructor() {
    this.users = new Map();
    this.biteReports = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createBiteReport(insertReport: InsertBiteReport): Promise<BiteReport> {
    const id = randomUUID();
    const report: BiteReport = { 
      ...insertReport, 
      id,
      createdAt: new Date()
    };
    this.biteReports.set(id, report);
    return report;
  }

  async getBiteReports(): Promise<BiteReport[]> {
    return Array.from(this.biteReports.values());
  }
}

export const storage = new MemStorage();
