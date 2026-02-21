// BTU calculation utilities and constants

export interface BTUCalculationInputs {
  squareFootage: number;
  climateZone: string;
  ceilingHeight: number;
  insulationQuality: "poor" | "average" | "good";
  windowArea: number;
  sunExposure: "low" | "medium" | "high";
  numberOfOccupants: number;
  systemType: "ductless" | "central" | "boiler";
}

export interface BTUCalculationBreakdown {
  baseLoad: number;
  ceilingAdjustment: number;
  insulationAdjustment: number;
  windowLoad: number;
  occupantLoad: number;
  total: number;
}

// Base BTU per square foot for cooling by climate zone
export const COOLING_BTU_PER_SQFT: Record<string, number> = {
  "1A": 15, "1B": 15,
  "2A": 18, "2B": 18,
  "3A": 20, "3B": 20, "3C": 18,
  "4A": 22, "4B": 22, "4C": 20,
  "5A": 24, "5B": 24, "5C": 22,
  "6A": 26, "6B": 26,
  "7": 28,
  "8": 30
};

// Base BTU per square foot for heating by climate zone
export const HEATING_BTU_PER_SQFT: Record<string, number> = {
  "1A": 30, "1B": 30,
  "2A": 35, "2B": 35,
  "3A": 40, "3B": 40, "3C": 40,
  "4A": 45, "4B": 45, "4C": 45,
  "5A": 50, "5B": 50, "5C": 50,
  "6A": 55, "6B": 55,
  "7": 60,
  "8": 65
};

// Insulation quality multipliers
export const INSULATION_MULTIPLIERS = {
  poor: 1.2,
  average: 1.0,
  good: 0.9
};

// Sun exposure multipliers for window cooling load (BTU/hr per sq ft)
export const WINDOW_COOLING_MULTIPLIERS = {
  low: 20,
  medium: 35,
  high: 50
};

// Climate zone multipliers for window heating load (BTU/hr per sq ft)
export const WINDOW_HEATING_MULTIPLIERS: Record<string, number> = {
  "5A": 25, "5B": 25, "5C": 25,
  "6A": 30, "6B": 30,
  "7": 35,
  "8": 40
};

export function calculateCoolingLoad(inputs: BTUCalculationInputs): BTUCalculationBreakdown {
  const {
    squareFootage,
    climateZone,
    ceilingHeight,
    insulationQuality,
    windowArea,
    sunExposure,
    numberOfOccupants
  } = inputs;

  // Base cooling load
  const baseBTUPerSqFt = COOLING_BTU_PER_SQFT[climateZone] || 24;
  let baseLoad = squareFootage * baseBTUPerSqFt;

  // Ceiling height adjustment
  const ceilingMultiplier = ceilingHeight / 8;
  const ceilingAdjustment = baseLoad * (ceilingMultiplier - 1);
  baseLoad *= ceilingMultiplier;

  // Insulation adjustment
  const insulationMultiplier = INSULATION_MULTIPLIERS[insulationQuality];
  const insulationAdjustment = baseLoad * (insulationMultiplier - 1);
  baseLoad *= insulationMultiplier;

  // Window cooling load
  const windowBTUPerSqFt = WINDOW_COOLING_MULTIPLIERS[sunExposure];
  const windowLoad = windowArea * windowBTUPerSqFt;

  // Occupant cooling load (600 BTU per additional person beyond 2)
  const occupantLoad = Math.max(0, (numberOfOccupants - 2) * 600);

  // Total cooling load
  const total = Math.max(
    baseLoad + windowLoad + occupantLoad,
    squareFootage * 12 // Minimum 12 BTU/sq ft
  );

  return {
    baseLoad: baseLoad - ceilingAdjustment - insulationAdjustment,
    ceilingAdjustment,
    insulationAdjustment,
    windowLoad,
    occupantLoad,
    total
  };
}

export function calculateHeatingLoad(inputs: BTUCalculationInputs): number {
  const {
    squareFootage,
    climateZone,
    ceilingHeight,
    insulationQuality,
    windowArea,
    numberOfOccupants
  } = inputs;

  // Base heating load
  const baseBTUPerSqFt = HEATING_BTU_PER_SQFT[climateZone] || 50;
  let baseLoad = squareFootage * baseBTUPerSqFt;

  // Ceiling height adjustment
  const ceilingMultiplier = ceilingHeight / 8;
  baseLoad *= ceilingMultiplier;

  // Insulation adjustment
  const insulationMultiplier = INSULATION_MULTIPLIERS[insulationQuality];
  baseLoad *= insulationMultiplier;

  // Window heating load
  const windowBTUPerSqFt = WINDOW_HEATING_MULTIPLIERS[climateZone] || 25;
  const windowLoad = windowArea * windowBTUPerSqFt;

  // Occupant heating adjustment (body heat reduces heating load)
  const occupantAdjustment = numberOfOccupants * -300;

  // Total heating load
  const total = Math.max(
    baseLoad + windowLoad + occupantAdjustment,
    squareFootage * 20 // Minimum 20 BTU/sq ft
  );

  return total;
}

export function calculateCoolingTonnage(coolingBTU: number): number {
  // Convert BTU/hr to tons (12,000 BTU/hr = 1 ton)
  // Round to nearest 0.5 ton
  return Math.round((coolingBTU / 12000) * 2) / 2;
}

export function generateEquipmentRecommendation(
  systemType: string,
  coolingBTU: number,
  heatingBTU: number,
  numberOfRooms: number
) {
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
      const tonnage = calculateCoolingTonnage(coolingBTU);
      return {
        systemType: "Central Air Conditioning System",
        description: `${tonnage} ton central air system`,
        details: [
          `${tonnage} ton capacity`,
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
