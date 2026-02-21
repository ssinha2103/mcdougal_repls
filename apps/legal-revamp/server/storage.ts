import { type User, type InsertUser, type ContactInquiry, type InsertContactInquiry } from "@shared/schema";
import { randomUUID } from "crypto";

// Extend the interface with contact inquiry methods
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactInquiry(inquiry: InsertContactInquiry): Promise<ContactInquiry>;
  getContactInquiries(): Promise<ContactInquiry[]>;
  getContactInquiry(id: string): Promise<ContactInquiry | undefined>;
  updateContactInquiryStatus(id: string, status: string): Promise<ContactInquiry | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contactInquiries: Map<string, ContactInquiry>;

  constructor() {
    this.users = new Map();
    this.contactInquiries = new Map();
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

  async createContactInquiry(insertInquiry: InsertContactInquiry): Promise<ContactInquiry> {
    const id = randomUUID();
    const now = new Date();
    const inquiry: ContactInquiry = {
      ...insertInquiry,
      id,
      status: "new",
      createdAt: now,
      updatedAt: now,
      phone: insertInquiry.phone || null,
      company: insertInquiry.company || null,
      practiceArea: insertInquiry.practiceArea || null,
      currentWebsite: insertInquiry.currentWebsite || null,
      budget: insertInquiry.budget || null,
      preferredContact: insertInquiry.preferredContact || null,
      timeline: insertInquiry.timeline || null,
    };
    this.contactInquiries.set(id, inquiry);
    
    // Log the inquiry for development purposes
    console.log("New contact inquiry received:", {
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      company: inquiry.company,
      practiceArea: inquiry.practiceArea,
      services: inquiry.services,
      message: inquiry.message.substring(0, 100) + "..."
    });
    
    return inquiry;
  }

  async getContactInquiries(): Promise<ContactInquiry[]> {
    return Array.from(this.contactInquiries.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getContactInquiry(id: string): Promise<ContactInquiry | undefined> {
    return this.contactInquiries.get(id);
  }

  async updateContactInquiryStatus(id: string, status: string): Promise<ContactInquiry | undefined> {
    const inquiry = this.contactInquiries.get(id);
    if (!inquiry) {
      return undefined;
    }

    const updatedInquiry: ContactInquiry = {
      ...inquiry,
      status,
      updatedAt: new Date(),
    };

    this.contactInquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }
}

export const storage = new MemStorage();
