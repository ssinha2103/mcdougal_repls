import { type KeywordResult } from "@shared/schema";

export interface IStorage {
  // Storage interface remains minimal as this is a processing-heavy application
  // Most data is transient and doesn't need persistence
}

export class MemStorage implements IStorage {
  constructor() {}
}

export const storage = new MemStorage();
