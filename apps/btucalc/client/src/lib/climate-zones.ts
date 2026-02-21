// Climate zone data for New England region
export interface ClimateZoneData {
  zipCode: string;
  climateZone: string;
  state: string;
  city?: string;
}

// IECC Climate Zone mapping for major New England ZIP codes
export const climateZones: ClimateZoneData[] = [
  // Massachusetts
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
  
  // New Hampshire
  { zipCode: "03301", climateZone: "6A", state: "NH", city: "Concord" },
  { zipCode: "03104", climateZone: "6A", state: "NH", city: "Manchester" },
  { zipCode: "03055", climateZone: "6A", state: "NH", city: "Londonderry" },
  { zipCode: "03038", climateZone: "6A", state: "NH", city: "Derry" },
  
  // Maine
  { zipCode: "04101", climateZone: "6A", state: "ME", city: "Portland" },
  { zipCode: "04102", climateZone: "6A", state: "ME", city: "Portland" },
  { zipCode: "04401", climateZone: "7", state: "ME", city: "Bangor" },
  { zipCode: "04330", climateZone: "6A", state: "ME", city: "Augusta" },
  
  // Vermont
  { zipCode: "05401", climateZone: "6A", state: "VT", city: "Burlington" },
  { zipCode: "05602", climateZone: "6A", state: "VT", city: "Montpelier" },
  { zipCode: "05753", climateZone: "6A", state: "VT", city: "Rutland" },
  
  // Connecticut
  { zipCode: "06101", climateZone: "5A", state: "CT", city: "Hartford" },
  { zipCode: "06103", climateZone: "5A", state: "CT", city: "Hartford" },
  { zipCode: "06511", climateZone: "5A", state: "CT", city: "New Haven" },
  { zipCode: "06905", climateZone: "5A", state: "CT", city: "Stamford" },
  
  // Rhode Island
  { zipCode: "02903", climateZone: "5A", state: "RI", city: "Providence" },
  { zipCode: "02906", climateZone: "5A", state: "RI", city: "Providence" },
  { zipCode: "02840", climateZone: "5A", state: "RI", city: "Newport" },
  { zipCode: "02908", climateZone: "5A", state: "RI", city: "Providence" },
];

export function getClimateZone(zipCode: string): ClimateZoneData | null {
  return climateZones.find(zone => zone.zipCode === zipCode) || null;
}

export function estimateClimateZone(zipCode: string): string {
  // Basic estimation for New England region
  const zip = parseInt(zipCode);
  
  if (zip >= 1000 && zip <= 2999) {
    // Massachusetts area
    return "5A";
  } else if (zip >= 3000 && zip <= 3999) {
    // New Hampshire area
    return "6A";
  } else if (zip >= 4000 && zip <= 4999) {
    // Maine area (mostly 6A, some 7)
    return zip >= 4400 ? "7" : "6A";
  } else if (zip >= 5000 && zip <= 5999) {
    // Vermont area
    return "6A";
  } else if (zip >= 6000 && zip <= 6999) {
    // Connecticut area
    return "5A";
  } else if (zip >= 2800 && zip <= 2999) {
    // Rhode Island area
    return "5A";
  }
  
  // Default for unknown areas in the region
  return "5A";
}
