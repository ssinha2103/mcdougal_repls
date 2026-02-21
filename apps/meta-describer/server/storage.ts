// Storage interface for the Meta Description Generator
// Currently using in-memory storage as no persistence is needed for this stateless tool

export interface IStorage {
  // No storage methods needed for this application
  // All functionality is handled via API calls to Gemini AI
}

export class MemStorage implements IStorage {
  constructor() {
    // No storage initialization needed
  }
}

export const storage = new MemStorage();
