import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { btuCalculationInputSchema, type BTUCalculationInput, type BTUCalculationResult } from "@shared/schema";
// Comprehensive climate zone mapping for all US ZIP codes
function estimateClimateZone(zipCode: string): string {
  const zip = parseInt(zipCode);
  
  // Zone 1A - Southern Florida, Hawaii
  if ((zip >= 33000 && zip <= 34999) || // South Florida
      (zip >= 96700 && zip <= 96899)) {   // Hawaii
    return "1A";
  }
  
  // Zone 2A - Central/North Florida, South Texas, South Louisiana, South Arizona
  if ((zip >= 32000 && zip <= 32999) ||  // Central Florida
      (zip >= 35000 && zip <= 35999) ||  // North Florida/South Georgia
      (zip >= 78000 && zip <= 79999) ||  // South Texas
      (zip >= 70000 && zip <= 70999) ||  // South Louisiana
      (zip >= 85000 && zip <= 85999)) {  // South Arizona
    return "2A";
  }
  
  // Zone 2B - Hawaii (dry areas)
  if (zip >= 96800 && zip <= 96999) {
    return "2B";
  }
  
  // Zone 3A - North Florida, South Georgia, South Alabama, South Mississippi, South Louisiana, South Texas, South Arizona, South California
  if ((zip >= 30000 && zip <= 31999) ||  // South Georgia
      (zip >= 36000 && zip <= 36999) ||  // South Alabama
      (zip >= 39000 && zip <= 39999) ||  // South Mississippi
      (zip >= 71000 && zip <= 71999) ||  // Central Louisiana
      (zip >= 77000 && zip <= 77999) ||  // Central Texas
      (zip >= 90000 && zip <= 93999)) {  // South California
    return "3A";
  }
  
  // Zone 3B - South Nevada, South California (dry areas)
  if ((zip >= 89000 && zip <= 89999) ||  // South Nevada
      (zip >= 92000 && zip <= 92999)) {  // South California (desert)
    return "3B";
  }
  
  // Zone 3C - Central/North California coast
  if ((zip >= 94000 && zip <= 95999)) {
    return "3C";
  }
  
  // Zone 4A - Central Georgia, Alabama, Mississippi, Arkansas, Tennessee, Kentucky, North Carolina, South Carolina, Virginia, Maryland, Delaware
  if ((zip >= 20000 && zip <= 21999) ||  // Maryland/DC
      (zip >= 19000 && zip <= 19999) ||  // Delaware
      (zip >= 27000 && zip <= 28999) ||  // North Carolina
      (zip >= 29000 && zip <= 29999) ||  // South Carolina
      (zip >= 22000 && zip <= 24999) ||  // Virginia
      (zip >= 37000 && zip <= 38999) ||  // Tennessee
      (zip >= 40000 && zip <= 42999) ||  // Kentucky
      (zip >= 35000 && zip <= 36999) ||  // Alabama
      (zip >= 38000 && zip <= 39999) ||  // Mississippi
      (zip >= 71600 && zip <= 72999) ||  // Arkansas
      (zip >= 30000 && zip <= 31999)) {  // Georgia
    return "4A";
  }
  
  // Zone 4B - New Mexico, Arizona, Nevada, Utah
  if ((zip >= 87000 && zip <= 88999) ||  // New Mexico
      (zip >= 86000 && zip <= 86999) ||  // Arizona
      (zip >= 89000 && zip <= 89999) ||  // Nevada
      (zip >= 84000 && zip <= 84999)) {  // Utah
    return "4B";
  }
  
  // Zone 4C - Oregon, Washington coast
  if ((zip >= 97000 && zip <= 97999) ||  // Oregon coast
      (zip >= 98000 && zip <= 98999)) {  // Washington coast
    return "4C";
  }
  
  // Zone 5A - New England, Mid-Atlantic, Great Lakes, Central Plains
  if ((zip >= 1000 && zip <= 2999) ||    // Massachusetts, Rhode Island
      (zip >= 6000 && zip <= 6999) ||    // Connecticut
      (zip >= 7000 && zip <= 8999) ||    // New Jersey
      (zip >= 10000 && zip <= 14999) ||  // New York
      (zip >= 15000 && zip <= 19999) ||  // Pennsylvania
      (zip >= 43000 && zip <= 45999) ||  // Ohio
      (zip >= 46000 && zip <= 47999) ||  // Indiana
      (zip >= 48000 && zip <= 49999) ||  // Michigan
      (zip >= 50000 && zip <= 52999) ||  // Iowa
      (zip >= 60000 && zip <= 62999) ||  // Illinois
      (zip >= 53000 && zip <= 54999) ||  // Wisconsin
      (zip >= 64000 && zip <= 65999) ||  // Missouri
      (zip >= 66000 && zip <= 67999) ||  // Kansas
      (zip >= 68000 && zip <= 69999)) {  // Nebraska
    return "5A";
  }
  
  // Zone 5B - Colorado, Wyoming, Idaho, Montana, Utah
  if ((zip >= 80000 && zip <= 81999) ||  // Colorado
      (zip >= 82000 && zip <= 83999) ||  // Wyoming
      (zip >= 83200 && zip <= 83800) ||  // Idaho
      (zip >= 59000 && zip <= 59999)) {  // Montana
    return "5B";
  }
  
  // Zone 6A - Northern New England, Northern Great Lakes, Northern Plains
  if ((zip >= 3000 && zip <= 3999) ||    // New Hampshire
      (zip >= 4000 && zip <= 4999) ||    // Maine (southern)
      (zip >= 5000 && zip <= 5999) ||    // Vermont
      (zip >= 55000 && zip <= 56999) ||  // Minnesota
      (zip >= 57000 && zip <= 58999) ||  // North Dakota/South Dakota
      (zip >= 54000 && zip <= 54999)) {  // Wisconsin (northern)
    return "6A";
  }
  
  // Zone 6B - Montana, Wyoming, Colorado (high elevation)
  if ((zip >= 59700 && zip <= 59999) ||  // Montana (high elevation)
      (zip >= 82000 && zip <= 82999) ||  // Wyoming (high elevation)
      (zip >= 81000 && zip <= 81999)) {  // Colorado (high elevation)
    return "6B";
  }
  
  // Zone 7 - Northern Maine, Alaska interior
  if ((zip >= 4400 && zip <= 4999) ||    // Northern Maine
      (zip >= 99500 && zip <= 99999)) {  // Alaska interior
    return "7";
  }
  
  // Zone 8 - Alaska (most areas)
  if (zip >= 99000 && zip <= 99499) {
    return "8";
  }
  
  // Texas - special handling due to size
  if (zip >= 75000 && zip <= 79999) {
    if (zip >= 79000) return "2A";      // South Texas
    if (zip >= 77000) return "3A";      // Central Texas
    return "4A";                        // North Texas
  }
  
  // California - special handling
  if (zip >= 90000 && zip <= 96999) {
    if (zip >= 95000) return "3C";      // North California coast
    if (zip >= 93000) return "3B";      // Central Valley/desert
    return "3A";                        // South California
  }
  
  // Default fallback based on general regions
  if (zip >= 90000) return "3A";  // West Coast
  if (zip >= 80000) return "5B";  // Mountain West
  if (zip >= 70000) return "3A";  // South Central
  if (zip >= 60000) return "5A";  // Midwest
  if (zip >= 50000) return "5A";  // Central Plains
  if (zip >= 40000) return "4A";  // Southeast
  if (zip >= 30000) return "3A";  // Deep South
  if (zip >= 20000) return "4A";  // Mid-Atlantic
  if (zip >= 10000) return "5A";  // Northeast
  
  // Final fallback
  return "5A";
}
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get climate zone by ZIP code
  app.get("/api/climate-zone/:zipCode", async (req, res) => {
    try {
      const { zipCode } = req.params;
      
      if (!/^\d{5}$/.test(zipCode)) {
        return res.status(400).json({ message: "Invalid ZIP code format" });
      }

      const climateZone = await storage.getClimateZoneByZip(zipCode);
      
      if (!climateZone) {
        // Use estimation logic based on ZIP code ranges
        const estimatedZone = estimateClimateZone(zipCode);
        return res.json({ 
          climateZone: estimatedZone, 
          estimated: true,
          message: "Climate zone estimated based on ZIP code and regional data" 
        });
      }

      res.json(climateZone);
    } catch (error) {
      res.status(500).json({ message: "Failed to get climate zone" });
    }
  });

  // Calculate BTU requirements
  app.post("/api/calculate-btu", async (req, res) => {
    try {
      const validatedData = btuCalculationInputSchema.parse(req.body);
      
      // Get climate zone for the ZIP code
      const climateZone = await storage.getClimateZoneByZip(validatedData.zipCode);
      const zone = climateZone?.climateZone || estimateClimateZone(validatedData.zipCode);
      
      // Perform BTU calculations
      const result = calculateBTULoads(validatedData, zone);
      
      // Save calculation to storage
      const calculationRecord = await storage.createBTUCalculation({
        ...validatedData,
        climateZone: zone,
        coolingBTU: result.coolingBTU,
        heatingBTU: result.heatingBTU,
        coolingTonnage: result.coolingTonnage,
        recommendations: result.recommendations,
        calculationBreakdown: result.breakdown,
      });

      res.json({ 
        ...result, 
        calculationId: calculationRecord.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to calculate BTU requirements" });
    }
  });

  // Get calculation history
  app.get("/api/calculations", async (req, res) => {
    try {
      const calculations = await storage.getUserBTUCalculations();
      res.json(calculations);
    } catch (error) {
      res.status(500).json({ message: "Failed to get calculation history" });
    }
  });

  // Get specific calculation
  app.get("/api/calculations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const calculation = await storage.getBTUCalculation(id);
      
      if (!calculation) {
        return res.status(404).json({ message: "Calculation not found" });
      }

      res.json(calculation);
    } catch (error) {
      res.status(500).json({ message: "Failed to get calculation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// BTU calculation logic based on ACCA Manual J principles
function calculateBTULoads(input: BTUCalculationInput, climateZone: string): BTUCalculationResult {
  const {
    systemType,
    squareFootage,
    numberOfRooms,
    ceilingHeight,
    insulationQuality,
    windowArea,
    sunExposure,
    numberOfOccupants
  } = input;

  // Base BTU per square foot based on climate zone
  const coolingBaseBTU = getBaseCoolingBTU(climateZone);
  const heatingBaseBTU = getBaseHeatingBTU(climateZone);

  // Calculate base loads
  let coolingBaseLoad = squareFootage * coolingBaseBTU;
  let heatingBaseLoad = squareFootage * heatingBaseBTU;

  // Ceiling height adjustment
  const ceilingMultiplier = ceilingHeight / 8;
  const ceilingAdjustment = (coolingBaseLoad * (ceilingMultiplier - 1));
  coolingBaseLoad *= ceilingMultiplier;
  heatingBaseLoad *= ceilingMultiplier;

  // Insulation quality adjustment
  const insulationMultiplier = getInsulationMultiplier(insulationQuality);
  const insulationAdjustment = coolingBaseLoad * (insulationMultiplier - 1);
  coolingBaseLoad *= insulationMultiplier;
  heatingBaseLoad *= insulationMultiplier;

  // Window load calculations
  const windowCoolingBTU = getWindowCoolingLoad(windowArea, sunExposure);
  const windowHeatingBTU = getWindowHeatingLoad(windowArea, climateZone);
  
  // Occupant load
  const occupantCoolingBTU = (numberOfOccupants - 2) * 600; // 600 BTU per additional person for cooling
  const occupantHeatingBTU = numberOfOccupants * -300; // Reduce heating load due to body heat

  // Total calculations
  const totalCoolingBTU = Math.max(
    coolingBaseLoad + windowCoolingBTU + Math.max(0, occupantCoolingBTU),
    squareFootage * 12 // Minimum 12 BTU/sq ft
  );
  
  const totalHeatingBTU = Math.max(
    heatingBaseLoad + windowHeatingBTU + occupantHeatingBTU,
    squareFootage * 20 // Minimum 20 BTU/sq ft
  );

  // Convert cooling to tonnage
  const coolingTonnage = Math.round((totalCoolingBTU / 12000) * 2) / 2; // Round to nearest 0.5 ton

  // Generate equipment recommendations
  const recommendations = generateRecommendations(systemType, totalCoolingBTU, totalHeatingBTU, numberOfRooms);

  // Enhanced calculation breakdown for detailed results
  const calculationBreakdown = {
    baseHeatingLoad: Math.round(squareFootage * heatingBaseBTU),
    baseCoolingLoad: Math.round(squareFootage * coolingBaseBTU),
    ceilingHeightMultiplier: Math.round(ceilingMultiplier * 100) / 100,
    insulationMultiplier: insulationMultiplier,
    windowHeatLoss: Math.round(windowHeatingBTU),
    windowSolarGain: Math.round(windowCoolingBTU),
    occupantLoad: Math.round(Math.max(0, occupantCoolingBTU)),
    climateZone: climateZone
  };

  return {
    coolingBTU: Math.round(totalCoolingBTU),
    heatingBTU: Math.round(totalHeatingBTU),
    coolingTonnage,
    climateZone,
    systemType,
    calculationBreakdown,
    recommendations
  };
}

function getBaseCoolingBTU(climateZone: string): number {
  const coolingBTUMap: Record<string, number> = {
    "1A": 15, "1B": 15,
    "2A": 18, "2B": 18,
    "3A": 20, "3B": 20, "3C": 18,
    "4A": 22, "4B": 22, "4C": 20,
    "5A": 24, "5B": 24, "5C": 22,
    "6A": 26, "6B": 26,
    "7": 28,
    "8": 30
  };
  return coolingBTUMap[climateZone] || 24;
}

function getBaseHeatingBTU(climateZone: string): number {
  const heatingBTUMap: Record<string, number> = {
    "1A": 30, "1B": 30,
    "2A": 35, "2B": 35,
    "3A": 40, "3B": 40, "3C": 40,
    "4A": 45, "4B": 45, "4C": 45,
    "5A": 50, "5B": 50, "5C": 50,
    "6A": 55, "6B": 55,
    "7": 60,
    "8": 65
  };
  return heatingBTUMap[climateZone] || 50;
}

function getInsulationMultiplier(quality: string): number {
  const multipliers = {
    poor: 1.2,
    average: 1.0,
    good: 0.9
  };
  return multipliers[quality as keyof typeof multipliers] || 1.0;
}

function getWindowCoolingLoad(windowArea: number, sunExposure: string): number {
  const exposureMultipliers = {
    low: 20,
    medium: 35,
    high: 50
  };
  return windowArea * (exposureMultipliers[sunExposure as keyof typeof exposureMultipliers] || 35);
}

function getWindowHeatingLoad(windowArea: number, climateZone: string): number {
  const zoneMultipliers: Record<string, number> = {
    "5A": 25, "5B": 25, "5C": 25,
    "6A": 30, "6B": 30,
    "7": 35,
    "8": 40
  };
  return windowArea * (zoneMultipliers[climateZone] || 25);
}

function generateRecommendations(systemType: string, coolingBTU: number, heatingBTU: number, numberOfRooms: number) {
  switch (systemType) {
    case "ductless":
      return {
        systemType: "Mitsubishi Electric Ductless Mini-Split",
        description: `Multi-zone ductless system with ${Math.ceil(numberOfRooms / 3)} outdoor units`,
        details: [
          `${Math.ceil(numberOfRooms / 2)}-Zone System`,
          "Hyper-Heat Technology for efficient heating",
          "SEER 22+ Rating for energy efficiency",
          "Individual room temperature control",
          "Quiet operation (as low as 19 dB)"
        ]
      };
    
    case "central":
      return {
        systemType: "Central Air Conditioning System",
        description: `${Math.round(coolingBTU / 12000 * 2) / 2} ton central air system`,
        details: [
          `${Math.round(coolingBTU / 12000 * 2) / 2} ton capacity`,
          "Variable speed compressor recommended",
          "SEER 16+ rating minimum",
          "Zoned system for larger homes",
          "Professional ductwork assessment required"
        ]
      };
    
    case "boiler":
      return {
        systemType: "High-Efficiency Gas Boiler",
        description: `${Math.round(heatingBTU / 1000)}K BTU input boiler system`,
        details: [
          `${Math.round(heatingBTU / 1000)}K BTU/hr input rating`,
          "95%+ AFUE efficiency",
          "Modulating condensing boiler",
          "Radiant floor or baseboard distribution",
          "Separate cooling system may be required"
        ]
      };
    
    default:
      return {
        systemType: "Custom HVAC Solution",
        description: "Contact N.E.T.R., Inc. for personalized recommendations",
        details: [
          "Professional load calculation required",
          "Site assessment recommended",
          "Multiple system options available"
        ]
      };
  }
}
