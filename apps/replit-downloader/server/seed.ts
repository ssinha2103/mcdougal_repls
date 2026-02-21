import { db } from "./db";
import { downloads } from "@shared/schema";
import { sql } from "drizzle-orm";
import { log } from "./index";

export async function seedDatabase() {
  try {
    const existing = await db.select({ count: sql<number>`count(*)` }).from(downloads);
    if (Number(existing[0].count) > 0) return;

    const seedData = [
      {
        replitUrl: "https://replit.com/@replit/Kaboom",
        replName: "Kaboom",
        username: "replit",
        status: "completed",
      },
      {
        replitUrl: "https://replit.com/@replit/Python-Template",
        replName: "Python-Template",
        username: "replit",
        status: "completed",
      },
      {
        replitUrl: "https://replit.com/@replit/Nodejs-Starter",
        replName: "Nodejs-Starter",
        username: "replit",
        status: "completed",
      },
    ];

    await db.insert(downloads).values(seedData);
    log("Seeded download history");
  } catch (error: any) {
    log(`Seed error (non-fatal): ${error.message}`);
  }
}
