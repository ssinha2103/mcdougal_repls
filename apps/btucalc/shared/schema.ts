import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const btuCalculations = pgTable("btu_calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  zipCode: text("zip_code").notNull(),
  climateZone: text("climate_zone").notNull(),
  systemType: text("system_type").notNull(),
  squareFootage: integer("square_footage").notNull(),
  numberOfRooms: integer("number_of_rooms").notNull(),
  ceilingHeight: real("ceiling_height").notNull().default(8),
  insulationQuality: text("insulation_quality").notNull(),
  windowArea: integer("window_area").notNull(),
  sunExposure: text("sun_exposure").notNull(),
  numberOfOccupants: integer("number_of_occupants").notNull(),
  coolingBTU: integer("cooling_btu").notNull(),
  heatingBTU: integer("heating_btu").notNull(),
  coolingTonnage: real("cooling_tonnage").notNull(),
  recommendations: jsonb("recommendations"),
  calculationBreakdown: jsonb("calculation_breakdown"),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const climateZones = pgTable("climate_zones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  zipCode: text("zip_code").notNull().unique(),
  climateZone: text("climate_zone").notNull(),
  state: text("state").notNull(),
  city: text("city"),
});

// Validation schemas
export const btuCalculationInputSchema = z.object({
  zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
  systemType: z.enum(["ductless", "central", "boiler"]),
  squareFootage: z.number().min(100).max(10000),
  numberOfRooms: z.number().min(1).max(20),
  ceilingHeight: z.number().min(7).max(15),
  insulationQuality: z.enum(["poor", "average", "good"]),
  windowArea: z.number().min(0).max(1000),
  sunExposure: z.enum(["low", "medium", "high"]),
  numberOfOccupants: z.number().min(1).max(12),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBtuCalculationSchema = createInsertSchema(btuCalculations).omit({
  id: true,
  createdAt: true,
});

export const insertClimateZoneSchema = createInsertSchema(climateZones).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BTUCalculationInput = z.infer<typeof btuCalculationInputSchema>;
export type BTUCalculation = typeof btuCalculations.$inferSelect;
export type InsertBTUCalculation = z.infer<typeof insertBtuCalculationSchema>;
export type ClimateZone = typeof climateZones.$inferSelect;
export type InsertClimateZone = z.infer<typeof insertClimateZoneSchema>;

// Response types
export type BTUCalculationResult = {
  coolingBTU: number;
  heatingBTU: number;
  coolingTonnage: number;
  climateZone: string;
  systemType: string;
  recommendations: string[];
  calculationBreakdown?: {
    baseHeatingLoad: number;
    baseCoolingLoad: number;
    ceilingHeightMultiplier: number;
    insulationMultiplier: number;
    windowHeatLoss: number;
    windowSolarGain: number;
    occupantLoad: number;
    climateZone: string;
  };
  equipmentRecommendations?: {
    minisplit?: { brand: string; model: string; capacity: string; efficiency: string };
    central?: { brand: string; model: string; capacity: string; efficiency: string };
    boiler?: { brand: string; model: string; capacity: string; efficiency: string };
  };
};
