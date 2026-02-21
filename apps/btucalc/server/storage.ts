import { type User, type InsertUser, type BTUCalculation, type InsertBTUCalculation, type ClimateZone, type InsertClimateZone } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // BTU Calculation methods
  createBTUCalculation(calculation: InsertBTUCalculation): Promise<BTUCalculation>;
  getBTUCalculation(id: string): Promise<BTUCalculation | undefined>;
  getUserBTUCalculations(userId?: string): Promise<BTUCalculation[]>;
  
  // Climate Zone methods
  getClimateZoneByZip(zipCode: string): Promise<ClimateZone | undefined>;
  createClimateZone(zone: InsertClimateZone): Promise<ClimateZone>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private btuCalculations: Map<string, BTUCalculation>;
  private climateZones: Map<string, ClimateZone>;

  constructor() {
    this.users = new Map();
    this.btuCalculations = new Map();
    this.climateZones = new Map();
    
    // Initialize with common climate zone data for New England
    this.initializeClimateZones();
  }

  private initializeClimateZones() {
    const climateZoneData = [
      // Massachusetts - Zone 5A
      { zipCode: "01845", climateZone: "5A", state: "MA", city: "North Andover" },
      { zipCode: "02101", climateZone: "5A", state: "MA", city: "Boston" },
      { zipCode: "02139", climateZone: "5A", state: "MA", city: "Cambridge" },
      { zipCode: "02134", climateZone: "5A", state: "MA", city: "Allston" },
      { zipCode: "02108", climateZone: "5A", state: "MA", city: "Boston" },
      { zipCode: "01602", climateZone: "5A", state: "MA", city: "Worcester" },
      { zipCode: "01701", climateZone: "5A", state: "MA", city: "Framingham" },
      { zipCode: "01801", climateZone: "5A", state: "MA", city: "Woburn" },
      { zipCode: "01960", climateZone: "5A", state: "MA", city: "Peabody" },
      { zipCode: "01970", climateZone: "5A", state: "MA", city: "Salem" },
      { zipCode: "01930", climateZone: "5A", state: "MA", city: "Gloucester" },
      
      // New Hampshire - Zone 6A
      { zipCode: "03301", climateZone: "6A", state: "NH", city: "Concord" },
      { zipCode: "03104", climateZone: "6A", state: "NH", city: "Manchester" },
      { zipCode: "03055", climateZone: "6A", state: "NH", city: "Londonderry" },
      { zipCode: "03038", climateZone: "6A", state: "NH", city: "Derry" },
      
      // Maine - Zone 6A and 7
      { zipCode: "04101", climateZone: "6A", state: "ME", city: "Portland" },
      { zipCode: "04102", climateZone: "6A", state: "ME", city: "Portland" },
      { zipCode: "04401", climateZone: "7", state: "ME", city: "Bangor" },
      { zipCode: "04330", climateZone: "6A", state: "ME", city: "Augusta" },
      
      // Vermont - Zone 6A
      { zipCode: "05401", climateZone: "6A", state: "VT", city: "Burlington" },
      { zipCode: "05602", climateZone: "6A", state: "VT", city: "Montpelier" },
      { zipCode: "05753", climateZone: "6A", state: "VT", city: "Rutland" },
      
      // Connecticut - Zone 5A
      { zipCode: "06101", climateZone: "5A", state: "CT", city: "Hartford" },
      { zipCode: "06103", climateZone: "5A", state: "CT", city: "Hartford" },
      { zipCode: "06511", climateZone: "5A", state: "CT", city: "New Haven" },
      { zipCode: "06905", climateZone: "5A", state: "CT", city: "Stamford" },
      
      // Rhode Island - Zone 5A
      { zipCode: "02903", climateZone: "5A", state: "RI", city: "Providence" },
      { zipCode: "02906", climateZone: "5A", state: "RI", city: "Providence" },
      { zipCode: "02840", climateZone: "5A", state: "RI", city: "Newport" },
      { zipCode: "02908", climateZone: "5A", state: "RI", city: "Providence" },
      
      // Additional major US cities for testing
      { zipCode: "10001", climateZone: "5A", state: "NY", city: "New York" },
      { zipCode: "90210", climateZone: "3A", state: "CA", city: "Beverly Hills" },
      { zipCode: "60601", climateZone: "5A", state: "IL", city: "Chicago" },
      { zipCode: "77001", climateZone: "2A", state: "TX", city: "Houston" },
      { zipCode: "33101", climateZone: "1A", state: "FL", city: "Miami" },
      { zipCode: "85001", climateZone: "2B", state: "AZ", city: "Phoenix" },
      { zipCode: "98101", climateZone: "4C", state: "WA", city: "Seattle" },
      { zipCode: "80201", climateZone: "5B", state: "CO", city: "Denver" },
      { zipCode: "56432", climateZone: "6A", state: "MN", city: "St. Cloud" },
      { zipCode: "45632", climateZone: "4A", state: "OH", city: "Portsmouth" },
      { zipCode: "43276", climateZone: "5A", state: "OH", city: "Columbus" },
      { zipCode: "99501", climateZone: "7", state: "AK", city: "Anchorage" },
    ];

    climateZoneData.forEach(zone => {
      const id = randomUUID();
      const climateZone: ClimateZone = { id, ...zone };
      this.climateZones.set(zone.zipCode, climateZone);
    });
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

  async createBTUCalculation(calculation: InsertBTUCalculation): Promise<BTUCalculation> {
    const id = randomUUID();
    const btuCalculation: BTUCalculation = { 
      ...calculation, 
      id, 
      createdAt: new Date() 
    };
    this.btuCalculations.set(id, btuCalculation);
    return btuCalculation;
  }

  async getBTUCalculation(id: string): Promise<BTUCalculation | undefined> {
    return this.btuCalculations.get(id);
  }

  async getUserBTUCalculations(userId?: string): Promise<BTUCalculation[]> {
    return Array.from(this.btuCalculations.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getClimateZoneByZip(zipCode: string): Promise<ClimateZone | undefined> {
    return this.climateZones.get(zipCode);
  }

  async createClimateZone(zone: InsertClimateZone): Promise<ClimateZone> {
    const id = randomUUID();
    const climateZone: ClimateZone = { id, ...zone };
    this.climateZones.set(zone.zipCode, climateZone);
    return climateZone;
  }
}

export const storage = new MemStorage();
