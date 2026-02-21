import type { Express } from "express";
import { createServer, type Server } from "http";
import axios from "axios";
import { Client } from "@googlemaps/google-maps-services-js";
import { searchRequestSchema, type AnalysisResponse, type LocalPackResult, type OrganicResult, insertSavedSearchSchema, insertSearchResultSchema } from "@shared/schema";
import { storage } from "./storage";

const googleMapsClient = new Client({});

// Mock data for testing when API is unavailable
function getMockSERPData(keyword: string, location: string): any {
  return {
    tasks: [{
      status_code: 20000,
      result: [{
        items: [
          {
            type: "map",
            items: [
              {
                rank_group: 1,
                title: "Smith & Associates Law Firm",
                address: "123 Main St, New York, NY 10001",
                phone: "(212) 555-0101",
                url: "https://smithlawfirm.com",
                rating: { value: 4.8, votes_count: 245 },
                place_id: "ChIJmock1",
                category: "Law Firm"
              },
              {
                rank_group: 2,
                title: "Johnson Legal Group",
                address: "456 Broadway, New York, NY 10013",
                phone: "(212) 555-0202",
                url: "https://johnsonlegal.com",
                rating: { value: 4.6, votes_count: 187 },
                place_id: "ChIJmock2",
                category: "Law Firm"
              },
              {
                rank_group: 3,
                title: "Metropolitan Family Law",
                address: "789 Park Ave, New York, NY 10021",
                phone: "(212) 555-0303",
                url: "https://metrofamilylaw.com",
                rating: { value: 4.9, votes_count: 312 },
                place_id: "ChIJmock3",
                category: "Divorce Lawyer"
              }
            ]
          },
          {
            type: "organic",
            rank_absolute: 1,
            title: "Best Divorce Lawyers in New York - Top Rated Attorneys",
            url: "https://nylegalservices.com/divorce",
            domain: "nylegalservices.com",
            description: "Experienced divorce attorneys serving New York City. Free consultation available."
          },
          {
            type: "organic",
            rank_absolute: 2,
            title: "New York Divorce Attorney | Family Law Specialists",
            url: "https://nyfamilylaw.com",
            domain: "nyfamilylaw.com",
            description: "Compassionate legal representation for divorce and custody matters."
          },
          {
            type: "organic",
            rank_absolute: 3,
            title: "Divorce Lawyer NYC - 25 Years Experience",
            url: "https://divorcenyc.com",
            domain: "divorcenyc.com",
            description: "Award-winning divorce lawyers with proven track record in NYC."
          },
          {
            type: "organic",
            rank_absolute: 4,
            title: "Manhattan Divorce Attorneys - Call Today",
            url: "https://manhattandivorce.com",
            domain: "manhattandivorce.com",
            description: "Skilled divorce attorneys handling complex cases in Manhattan."
          },
          {
            type: "organic",
            rank_absolute: 5,
            title: "NYC Family Law Center | Divorce & Custody",
            url: "https://nycfamilylawcenter.com",
            domain: "nycfamilylawcenter.com",
            description: "Comprehensive family law services including divorce and child custody."
          }
        ]
      }]
    }]
  };
}

// DataForSEO API helper
async function fetchDataForSEOResults(keyword: string, location: string): Promise<any> {
  const credentials = {
    username: process.env.DATAFORSEO_LOGIN || "",
    password: process.env.DATAFORSEO_PASSWORD || "",
  };

  const requestBody = [
    {
      keyword: keyword,
      location_name: location,
      language_code: "en",
      device: "desktop",
      os: "windows",
    },
  ];

  try {
    // Check if credentials are configured
    if (!credentials.username || !credentials.password) {
      console.log("DataForSEO credentials not configured, using mock data");
      return getMockSERPData(keyword, location);
    }

    const response = await axios.post(
      "https://api.dataforseo.com/v3/serp/google/organic/live/advanced",
      requestBody,
      {
        auth: credentials,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("DataForSEO Response Status:", response.status);
    
    // Check if the response is valid
    if (response.data?.tasks?.[0]?.status_code === 20000) {
      return response.data;
    } else {
      console.log("DataForSEO returned error status, using mock data fallback");
      return getMockSERPData(keyword, location);
    }
  } catch (error: any) {
    console.error("DataForSEO API error:", error.response?.data || error.message);
    console.error("DataForSEO API status:", error.response?.status);
    
    // Return mock data as fallback
    console.log("Using mock data as fallback due to API error");
    return getMockSERPData(keyword, location);
  }
}

// Google Places API helper - get place details
async function getPlaceDetails(placeId: string): Promise<any> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || "";

  try {
    const response = await googleMapsClient.placeDetails({
      params: {
        place_id: placeId,
        key: apiKey,
        fields: ["name", "rating", "user_ratings_total", "business_status", "website", "formatted_phone_number", "formatted_address"],
      },
    });

    return response.data.result;
  } catch (error) {
    console.error("Google Places API error:", error);
    return null;
  }
}

// Google Places API helper - search for place by name and location
async function searchPlace(name: string, location: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || "";

  try {
    const response = await googleMapsClient.findPlaceFromText({
      params: {
        input: `${name} ${location}`,
        inputtype: "textquery" as any,
        key: apiKey,
        fields: ["place_id"],
      },
    });

    if (response.data.candidates && response.data.candidates.length > 0) {
      return response.data.candidates[0].place_id || null;
    }
    return null;
  } catch (error) {
    console.error("Google Places search error:", error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/analyze - Analyze competition for a keyword and location
  app.post("/api/analyze", async (req, res) => {
    try {
      const validatedData = searchRequestSchema.parse(req.body);
      const { keyword, location } = validatedData;

      // Fetch SERP data from DataForSEO
      const serpData = await fetchDataForSEOResults(keyword, location);

      if (!serpData.tasks || serpData.tasks.length === 0) {
        return res.status(500).json({ error: "No data returned from SERP API" });
      }

      const task = serpData.tasks[0];
      if (task.status_code !== 20000) {
        console.warn("DataForSEO task warning:", task.status_code, task.status_message);
        // Continue with available data instead of failing
      }

      const items = task.result?.[0]?.items || [];

      // Process Local Pack results (map pack)
      const localPackResults: LocalPackResult[] = [];
      
      // Find the map item and extract the actual local pack listings from items array
      const mapItem = items.find((item: any) => item.type === "map");
      const localPackItems = mapItem?.items || [];

      for (const item of localPackItems.slice(0, 3)) {
        const localResult: LocalPackResult = {
          position: item.rank_group || localPackResults.length + 1,
          title: item.title || "Unknown",
          address: item.address || undefined,
          phone: item.phone || undefined,
          website: item.url || undefined,
          rating: item.rating?.value || undefined,
          reviewCount: item.rating?.votes_count || undefined,
          placeId: item.place_id || undefined,
          claimed: undefined,
          category: item.category || undefined,
        };

        // Enrich with Google Places data if we have a place_id (skip mock place IDs)
        if (item.place_id && !item.place_id.startsWith('ChIJmock')) {
          const placeDetails = await getPlaceDetails(item.place_id);
          if (placeDetails) {
            localResult.rating = placeDetails.rating || localResult.rating;
            localResult.reviewCount = placeDetails.user_ratings_total || localResult.reviewCount;
            localResult.claimed = placeDetails.business_status === "OPERATIONAL";
            localResult.website = placeDetails.website || localResult.website;
            localResult.phone = placeDetails.formatted_phone_number || localResult.phone;
            localResult.address = placeDetails.formatted_address || localResult.address;
          }
        } else if (!item.place_id) {
          // Try to find place_id using Google Places search (only for real data, not mocks)
          const placeId = await searchPlace(item.title, location);
          if (placeId) {
            localResult.placeId = placeId;
            const placeDetails = await getPlaceDetails(placeId);
            if (placeDetails) {
              localResult.rating = placeDetails.rating || localResult.rating;
              localResult.reviewCount = placeDetails.user_ratings_total || localResult.reviewCount;
              localResult.claimed = placeDetails.business_status === "OPERATIONAL";
              localResult.website = placeDetails.website || localResult.website;
              localResult.phone = placeDetails.formatted_phone_number || localResult.phone;
              localResult.address = placeDetails.formatted_address || localResult.address;
            }
          }
        }

        localPackResults.push(localResult);
      }

      // Process Organic results
      const organicResults: OrganicResult[] = [];
      const organicItems = items.filter((item: any) => item.type === "organic");

      for (const item of organicItems.slice(0, 10)) {
        const organicResult: OrganicResult = {
          position: item.rank_group || item.rank_absolute || organicResults.length + 1,
          title: item.title || "Unknown",
          url: item.url || "",
          domain: item.domain || undefined,
          description: item.description || undefined,
          placeId: undefined,
          rating: undefined,
          reviewCount: undefined,
          claimed: undefined,
        };

        // Try to find and enrich with Google Places data
        const placeId = await searchPlace(item.title, location);
        if (placeId) {
          organicResult.placeId = placeId;
          const placeDetails = await getPlaceDetails(placeId);
          if (placeDetails) {
            organicResult.rating = placeDetails.rating || undefined;
            organicResult.reviewCount = placeDetails.user_ratings_total || undefined;
            organicResult.claimed = placeDetails.business_status === "OPERATIONAL";
          }
        }

        organicResults.push(organicResult);
      }

      // Calculate summary statistics
      const allResults = [...localPackResults, ...organicResults];
      const resultsWithRatings = allResults.filter(r => r.rating !== undefined);
      const resultsWithClaimedStatus = allResults.filter(r => r.claimed !== undefined);
      const claimedResults = resultsWithClaimedStatus.filter(r => r.claimed === true);

      const avgRating = resultsWithRatings.length > 0
        ? resultsWithRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / resultsWithRatings.length
        : undefined;

      const claimedPercentage = resultsWithClaimedStatus.length > 0
        ? Math.round((claimedResults.length / resultsWithClaimedStatus.length) * 100)
        : undefined;

      const topCompetitor = localPackResults[0]?.title || organicResults[0]?.title || undefined;

      const response: AnalysisResponse = {
        keyword,
        location,
        timestamp: new Date().toISOString(),
        localPack: localPackResults,
        organic: organicResults,
        summary: {
          totalResults: localPackResults.length + organicResults.length,
          avgRating,
          claimedPercentage,
          topCompetitor,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("Analysis error:", error);
      if (error instanceof Error) {
        res.status(500).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to analyze competition" });
      }
    }
  });

  // GET /api/saved-searches - Get all saved searches
  app.get("/api/saved-searches", async (req, res) => {
    try {
      const searches = await storage.getSavedSearches();
      res.json(searches);
    } catch (error) {
      console.error("Error fetching saved searches:", error);
      res.status(500).json({ error: "Failed to fetch saved searches" });
    }
  });

  // POST /api/saved-searches - Create a new saved search
  app.post("/api/saved-searches", async (req, res) => {
    try {
      const validatedData = insertSavedSearchSchema.parse(req.body);
      const search = await storage.createSavedSearch(validatedData);
      res.json(search);
    } catch (error) {
      console.error("Error creating saved search:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create saved search" });
      }
    }
  });

  // GET /api/saved-searches/:id - Get a specific saved search
  app.get("/api/saved-searches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const search = await storage.getSavedSearch(id);
      if (!search) {
        return res.status(404).json({ error: "Saved search not found" });
      }
      res.json(search);
    } catch (error) {
      console.error("Error fetching saved search:", error);
      res.status(500).json({ error: "Failed to fetch saved search" });
    }
  });

  // PATCH /api/saved-searches/:id - Update a saved search
  app.patch("/api/saved-searches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSavedSearchSchema.partial().parse(req.body);
      const search = await storage.updateSavedSearch(id, validatedData);
      if (!search) {
        return res.status(404).json({ error: "Saved search not found" });
      }
      res.json(search);
    } catch (error) {
      console.error("Error updating saved search:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update saved search" });
      }
    }
  });

  // DELETE /api/saved-searches/:id - Delete a saved search (cascade deletes results)
  app.delete("/api/saved-searches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSavedSearch(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting saved search:", error);
      res.status(500).json({ error: "Failed to delete saved search" });
    }
  });

  // GET /api/search-results/:savedSearchId - Get all historical results for a saved search
  app.get("/api/search-results/:savedSearchId", async (req, res) => {
    try {
      const savedSearchId = parseInt(req.params.savedSearchId);
      const results = await storage.getSearchResults(savedSearchId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
      res.status(500).json({ error: "Failed to fetch search results" });
    }
  });

  // POST /api/search-results - Save a search result
  app.post("/api/search-results", async (req, res) => {
    try {
      const validatedData = insertSearchResultSchema.parse(req.body);
      const result = await storage.createSearchResult(validatedData);
      res.json(result);
    } catch (error) {
      console.error("Error creating search result:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create search result" });
      }
    }
  });

  // GET /api/search-history - Get search history by keyword and location
  app.get("/api/search-history", async (req, res) => {
    try {
      const { keyword, location } = req.query;
      if (!keyword || !location) {
        return res.status(400).json({ error: "keyword and location are required" });
      }
      const results = await storage.getSearchResultsByKeywordLocation(
        keyword as string, 
        location as string
      );
      res.json(results);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ error: "Failed to fetch search history" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
