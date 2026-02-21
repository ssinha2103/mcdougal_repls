// This schema generator is a pure frontend tool
// No database storage is required since users generate and copy/paste schema markup directly
// All validation and generation logic is handled client-side

export interface IStorage {
  // No storage methods needed for this application
}

export class MemStorage implements IStorage {
  constructor() {
    // No storage needed
  }
}

export const storage = new MemStorage();
