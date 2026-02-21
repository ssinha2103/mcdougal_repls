import { 
  type User, 
  type InsertUser, 
  type Tool, 
  type InsertTool,
  type Analytics,
  type InsertAnalytics
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

interface StorageData {
  users: User[];
  tools: Tool[];
  analytics: Analytics[];
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllTools(): Promise<Tool[]>;
  getTool(id: string): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: string, tool: Partial<InsertTool>): Promise<Tool | undefined>;
  deleteTool(id: string): Promise<boolean>;
  
  trackClick(toolId: string): Promise<Analytics>;
  getPopularTools(limit?: number): Promise<{ toolId: string; clickCount: number; tool?: Tool }[]>;
}

export class JsonStorage implements IStorage {
  private dataPath: string;
  private data: StorageData = { users: [], tools: [], analytics: [] };

  constructor() {
    this.dataPath = path.join(process.cwd(), "data.json");
    this.initialize();
  }

  private async initialize() {
    await this.loadData();
    await this.seedDataIfEmpty();
  }

  private async loadData() {
    try {
      const fileContent = await fs.readFile(this.dataPath, "utf-8");
      this.data = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist, use default empty data
      this.data = { users: [], tools: [], analytics: [] };
      await this.saveData();
    }
  }

  private async saveData() {
    await fs.writeFile(this.dataPath, JSON.stringify(this.data, null, 2), "utf-8");
  }

  private async seedDataIfEmpty() {
    if (this.data.users.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      this.data.users.push({
        id: randomUUID(),
        username: "admin",
        password: hashedPassword,
        isAdmin: 1,
      });
    }

    if (this.data.tools.length === 0) {
      const initialTools: InsertTool[] = [
        {
          name: "Keyword Combiner",
          url: "/keyword-mixer/",
          description: "Combine multiple keywords into powerful variations for comprehensive keyword research and content planning.",
          categories: ["Utilities", "Content"],
        },
        {
          name: "Word Counter",
          url: "/text-clarity/",
          description: "Analyze text length, word count, and character count for optimal content optimization and SEO performance.",
          categories: ["Utilities", "Content"],
        },
        {
          name: "AI SEO Page Score",
          url: "/ai-seo-pagescore/",
          description: "Analyze any URL for E-E-A-T signals and get AI-powered recommendations to improve search rankings.",
          categories: ["Analysis", "On-Page"],
        },
        {
          name: "SERP Snippet Audit",
          url: "/serpsnippet-audit/",
          description: "Preview and optimize your meta titles and descriptions to maximize click-through rates from search results.",
          categories: ["On-Page", "Analysis"],
        },
        {
          name: "Header Hierarchy",
          url: "/header-hierarchy/",
          description: "Audit your page's heading structure to ensure proper SEO hierarchy and improved content accessibility.",
          categories: ["On-Page", "Technical"],
        },
        {
          name: "Link Auditor",
          url: "/link-auditor/",
          description: "Discover broken links, analyze internal linking structure, and identify opportunities for better site architecture.",
          categories: ["Technical", "On-Page"],
        },
        {
          name: "Intent Discover",
          url: "/intent-discover/",
          description: "Uncover user search intent behind keywords to create content that perfectly matches audience needs.",
          categories: ["Analysis", "Content"],
        },
        {
          name: "YouTube Insight Tool",
          url: "/tube-insight/",
          description: "Analyze YouTube video performance, discover trending topics, and optimize your video SEO strategy.",
          categories: ["YouTube", "Content"],
        },
        {
          name: "SEO Headline Pro",
          url: "/seo-headline-pro/",
          description: "Craft compelling, SEO-optimized headlines that drive clicks and improve search engine visibility.",
          categories: ["Content", "On-Page"],
        },
      ];

      for (const toolData of initialTools) {
        this.data.tools.push({
          ...toolData,
          id: randomUUID(),
          createdAt: new Date().toISOString(),
        });
      }
    }

    await this.saveData();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.data.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.data.users.find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const user: User = {
      id: randomUUID(),
      username: insertUser.username,
      password: hashedPassword,
      isAdmin: 0,
    };
    this.data.users.push(user);
    await this.saveData();
    return user;
  }

  async getAllTools(): Promise<Tool[]> {
    return [...this.data.tools].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTool(id: string): Promise<Tool | undefined> {
    return this.data.tools.find(t => t.id === id);
  }

  async createTool(insertTool: InsertTool): Promise<Tool> {
    const tool: Tool = {
      ...insertTool,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.tools.push(tool);
    await this.saveData();
    return tool;
  }

  async updateTool(id: string, toolUpdate: Partial<InsertTool>): Promise<Tool | undefined> {
    const index = this.data.tools.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    this.data.tools[index] = {
      ...this.data.tools[index],
      ...toolUpdate,
    };
    await this.saveData();
    return this.data.tools[index];
  }

  async deleteTool(id: string): Promise<boolean> {
    const index = this.data.tools.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.data.tools.splice(index, 1);
    // Also remove analytics for this tool
    this.data.analytics = this.data.analytics.filter(a => a.toolId !== id);
    await this.saveData();
    return true;
  }

  async trackClick(toolId: string): Promise<Analytics> {
    const click: Analytics = {
      id: randomUUID(),
      toolId,
      clickedAt: new Date().toISOString(),
    };
    this.data.analytics.push(click);
    await this.saveData();
    return click;
  }

  async getPopularTools(limit: number = 5): Promise<{ toolId: string; clickCount: number; tool?: Tool }[]> {
    const clickCounts = new Map<string, number>();
    
    for (const analytic of this.data.analytics) {
      clickCounts.set(analytic.toolId, (clickCounts.get(analytic.toolId) || 0) + 1);
    }

    const results = Array.from(clickCounts.entries())
      .map(([toolId, clickCount]) => ({
        toolId,
        clickCount,
        tool: this.data.tools.find(t => t.id === toolId),
      }))
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, limit);

    return results;
  }
}

export const storage = new JsonStorage();
