import { type AsbestosSite, type InsertAsbestosSite, type ContactSubmission, type InsertContactSubmission } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Asbestos sites
  getAllAsbestosSites(): Promise<AsbestosSite[]>;
  getAsbestosSiteById(id: string): Promise<AsbestosSite | undefined>;
  createAsbestosSite(site: InsertAsbestosSite): Promise<AsbestosSite>;
  getAsbestosSitesByFilter(filters: {
    state?: string;
    siteType?: string;
    exposurePeriod?: string;
    searchTerm?: string;
  }): Promise<AsbestosSite[]>;

  // Contact submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  updateContactSubmission(id: string, updates: Partial<ContactSubmission>): Promise<ContactSubmission>;
}

export class MemStorage implements IStorage {
  private asbestosSites: Map<string, AsbestosSite>;
  private contactSubmissions: Map<string, ContactSubmission>;

  constructor() {
    this.asbestosSites = new Map();
    this.contactSubmissions = new Map();
    // No seed data - using database storage instead
  }

  private seedData() {
    // No seed data - using database storage with Kentucky sites only
    return;
  }

  async getAllAsbestosSites(): Promise<AsbestosSite[]> {
    return Array.from(this.asbestosSites.values());
  }

  async getAsbestosSiteById(id: string): Promise<AsbestosSite | undefined> {
    return this.asbestosSites.get(id);
  }

  async createAsbestosSite(insertSite: InsertAsbestosSite): Promise<AsbestosSite> {
    const id = randomUUID();
    const site: AsbestosSite = {
      ...insertSite,
      id,
      createdAt: new Date()
    };
    this.asbestosSites.set(id, site);
    return site;
  }

  async getAsbestosSitesByFilter(filters: {
    state?: string;
    siteType?: string;
    exposurePeriod?: string;
    searchTerm?: string;
  }): Promise<AsbestosSite[]> {
    let sites = Array.from(this.asbestosSites.values());

    if (filters.state) {
      sites = sites.filter(site => site.state === filters.state);
    }

    if (filters.siteType) {
      sites = sites.filter(site => site.siteType === filters.siteType);
    }

    if (filters.exposurePeriod) {
      sites = sites.filter(site => site.exposurePeriod.includes(filters.exposurePeriod!));
    }

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      sites = sites.filter(site => 
        site.name.toLowerCase().includes(term) ||
        site.city.toLowerCase().includes(term) ||
        site.state.toLowerCase().includes(term) ||
        site.description.toLowerCase().includes(term)
      );
    }

    return sites;
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = randomUUID();
    const submission: ContactSubmission = {
      ...insertSubmission,
      id,
      status: insertSubmission.status || "new",
      priority: insertSubmission.priority || "medium",
      symptoms: insertSubmission.symptoms || null,
      additionalInfo: insertSubmission.additionalInfo || null,
      assignedLawyer: insertSubmission.assignedLawyer || null,
      notes: insertSubmission.notes || null,
      lastContactDate: insertSubmission.lastContactDate || null,
      consent: insertSubmission.consent || false,
      submittedAt: new Date(),
      updatedAt: new Date()
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values()).sort((a, b) => 
      new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime()
    );
  }

  async updateContactSubmission(id: string, updates: Partial<ContactSubmission>): Promise<ContactSubmission> {
    const submission = this.contactSubmissions.get(id);
    if (!submission) {
      throw new Error("Contact submission not found");
    }
    
    const updated = {
      ...submission,
      ...updates,
      updatedAt: new Date()
    };
    
    this.contactSubmissions.set(id, updated);
    return updated;
  }




}

// Use MemStorage for simple in-memory data persistence
export const storage = new MemStorage();
