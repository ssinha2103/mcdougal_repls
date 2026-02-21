import axios from "axios";
import * as cheerio from "cheerio";
import type { NAPData } from "@shared/schema";

export interface DirectoryConfig {
  name: string;
  scraper: (firmName: string, location: string) => Promise<{
    found: boolean;
    napData?: NAPData;
    url?: string;
  }>;
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10);
}

function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export function compareNAPField(canonical: string, directory: string | undefined): "consistent" | "inconsistent" | "missing" {
  if (!directory || directory.trim() === "") {
    return "missing";
  }
  
  const canonicalNorm = normalizeText(canonical);
  const directoryNorm = normalizeText(directory);
  
  if (canonicalNorm.includes(directoryNorm) || directoryNorm.includes(canonicalNorm)) {
    return "consistent";
  }
  
  if (canonical.match(/\d/) && directory.match(/\d/)) {
    const canonicalPhone = normalizePhone(canonical);
    const directoryPhone = normalizePhone(directory);
    if (canonicalPhone === directoryPhone) {
      return "consistent";
    }
  }
  
  return "inconsistent";
}

async function scrapeAvvo(firmName: string, location: string) {
  try {
    const searchQuery = encodeURIComponent(`${firmName} ${location}`);
    const searchUrl = `https://www.avvo.com/search/lawyer_search?q=${searchQuery}`;
    
    return {
      found: false,
      napData: undefined,
      url: searchUrl,
    };
  } catch (error) {
    return { found: false };
  }
}

async function scrapeFindLaw(firmName: string, location: string) {
  try {
    const searchUrl = `https://lawyers.findlaw.com`;
    
    return {
      found: false,
      napData: undefined,
      url: searchUrl,
    };
  } catch (error) {
    return { found: false };
  }
}

async function scrapeJustia(firmName: string, location: string) {
  try {
    const searchUrl = `https://www.justia.com/lawyers`;
    
    return {
      found: false,
      napData: undefined,
      url: searchUrl,
    };
  } catch (error) {
    return { found: false };
  }
}

async function scrapeYelp(firmName: string, location: string) {
  try {
    const searchQuery = encodeURIComponent(firmName);
    const locationQuery = encodeURIComponent(location);
    const searchUrl = `https://www.yelp.com/search?find_desc=${searchQuery}&find_loc=${locationQuery}`;
    
    return {
      found: false,
      napData: undefined,
      url: searchUrl,
    };
  } catch (error) {
    return { found: false };
  }
}

async function scrapeYellowPages(firmName: string, location: string) {
  try {
    const searchUrl = `https://www.yellowpages.com`;
    
    return {
      found: false,
      napData: undefined,
      url: searchUrl,
    };
  } catch (error) {
    return { found: false };
  }
}

async function scrapeNolo(firmName: string, location: string) {
  try {
    const searchUrl = `https://www.nolo.com/lawyers`;
    
    return {
      found: false,
      napData: undefined,
      url: searchUrl,
    };
  } catch (error) {
    return { found: false };
  }
}

async function scrapeMartindale(firmName: string, location: string) {
  try {
    const searchUrl = `https://www.martindale.com`;
    
    return {
      found: false,
      napData: undefined,
      url: searchUrl,
    };
  } catch (error) {
    return { found: false };
  }
}

async function scrapeLawyers(firmName: string, location: string) {
  try {
    const searchUrl = `https://www.lawyers.com`;
    
    return {
      found: false,
      napData: undefined,
      url: searchUrl,
    };
  } catch (error) {
    return { found: false };
  }
}

export const DIRECTORIES: DirectoryConfig[] = [
  { name: "Avvo", scraper: scrapeAvvo },
  { name: "FindLaw", scraper: scrapeFindLaw },
  { name: "Justia", scraper: scrapeJustia },
  { name: "Yelp", scraper: scrapeYelp },
  { name: "Yellow Pages", scraper: scrapeYellowPages },
  { name: "Nolo", scraper: scrapeNolo },
  { name: "Martindale-Hubbell", scraper: scrapeMartindale },
  { name: "Lawyers.com", scraper: scrapeLawyers },
];
