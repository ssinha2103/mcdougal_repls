import type { Express } from "express";
import { createServer, type Server } from "http";
import { searchRequestSchema, type NAPCheckResponse, type DirectoryResult } from "@shared/schema";
import { searchGooglePlaces } from "./google-places";
import { DIRECTORIES, compareNAPField } from "./directory-scrapers";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/check-nap", async (req, res) => {
    try {
      const validation = searchRequestSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid request",
          details: validation.error.issues 
        });
      }

      const { firmName, location } = validation.data;

      const googleResult = await searchGooglePlaces(firmName, location);

      if (!googleResult) {
        return res.status(404).json({ 
          error: "Business not found in Google Places" 
        });
      }

      const { napData: canonicalNAP, placeId } = googleResult;

      const directoryChecks = await Promise.allSettled(
        DIRECTORIES.map(async (directory) => {
          try {
            const result = await directory.scraper(firmName, location);
            
            const directoryResult: DirectoryResult = {
              directoryName: directory.name,
              directoryUrl: result.url,
              found: result.found,
              napData: result.napData,
              nameMatch: compareNAPField(canonicalNAP.name, result.napData?.name),
              addressMatch: compareNAPField(canonicalNAP.address, result.napData?.address),
              phoneMatch: compareNAPField(canonicalNAP.phone, result.napData?.phone),
            };

            return directoryResult;
          } catch (error) {
            return {
              directoryName: directory.name,
              found: false,
              nameMatch: "missing" as const,
              addressMatch: "missing" as const,
              phoneMatch: "missing" as const,
            };
          }
        })
      );

      const directoryResults: DirectoryResult[] = directoryChecks.map((result, index) => {
        if (result.status === "fulfilled") {
          return result.value;
        }
        return {
          directoryName: DIRECTORIES[index].name,
          found: false,
          nameMatch: "missing" as const,
          addressMatch: "missing" as const,
          phoneMatch: "missing" as const,
        };
      });

      const summary = directoryResults.reduce(
        (acc, result) => {
          acc.totalDirectories++;
          
          if (!result.found) {
            acc.missing++;
          } else {
            const hasInconsistency = 
              result.nameMatch === "inconsistent" ||
              result.addressMatch === "inconsistent" ||
              result.phoneMatch === "inconsistent";
            
            if (hasInconsistency) {
              acc.inconsistent++;
            } else {
              acc.consistent++;
            }
          }
          
          return acc;
        },
        { totalDirectories: 0, consistent: 0, inconsistent: 0, missing: 0 }
      );

      const savedCheck = await storage.createNAPCheckWithResults(
        {
          firmName,
          location,
          canonicalName: canonicalNAP.name,
          canonicalAddress: canonicalNAP.address,
          canonicalPhone: canonicalNAP.phone,
          googlePlacesId: placeId,
          totalDirectories: summary.totalDirectories,
          consistentCount: summary.consistent,
          inconsistentCount: summary.inconsistent,
          missingCount: summary.missing,
          batchId: null,
          monitoringEnabled: false,
          monitoringFrequency: null,
        },
        directoryResults.map((result) => ({
          checkId: 0,
          directoryName: result.directoryName,
          directoryUrl: result.directoryUrl || null,
          found: result.found,
          napData: result.napData || null,
          nameMatch: result.nameMatch,
          addressMatch: result.addressMatch,
          phoneMatch: result.phoneMatch,
        }))
      );

      const response: NAPCheckResponse = {
        canonicalNAP,
        googlePlacesId: placeId,
        directoryResults,
        checkedAt: savedCheck.checkedAt.toISOString(),
        summary,
      };

      res.json(response);
    } catch (error) {
      console.error("NAP check error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to check NAP consistency" 
      });
    }
  });

  app.get("/api/checks", async (req, res) => {
    try {
      const limitParam = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const limit = isNaN(limitParam) || limitParam < 1 ? 50 : Math.min(limitParam, 100);
      const checks = await storage.getAllNAPChecks(limit);
      res.json(checks);
    } catch (error) {
      console.error("Get checks error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch checks" 
      });
    }
  });

  app.get("/api/checks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const check = await storage.getNAPCheck(id);
      
      if (!check) {
        return res.status(404).json({ error: "Check not found" });
      }

      const directoryResultsData = await storage.getDirectoryResultsByCheckId(id);
      
      const response = {
        check,
        directoryResults: directoryResultsData,
      };

      res.json(response);
    } catch (error) {
      console.error("Get check error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch check" 
      });
    }
  });

  app.post("/api/batch-check", async (req, res) => {
    try {
      const { firms } = req.body;
      
      if (!Array.isArray(firms) || firms.length === 0) {
        return res.status(400).json({ error: "Invalid request: firms array required" });
      }

      const batch = await storage.createBatchCheck({
        name: null,
        completedAt: null,
        status: "pending",
        totalFirms: firms.length,
        completedFirms: 0,
      });

      const checkIds: number[] = [];
      for (const firm of firms) {
        const { firmName, location } = firm;

        if (!firmName || !location) continue;

        try {
          const googleResult = await searchGooglePlaces(firmName, location);
          
          if (!googleResult) {
            continue;
          }

          const { napData: canonicalNAP, placeId } = googleResult;
          const directoryChecks = await Promise.allSettled(
            DIRECTORIES.map(async (directory) => {
              try {
                const result = await directory.scraper(firmName, location);
                
                const directoryResult: DirectoryResult = {
                  directoryName: directory.name,
                  directoryUrl: result.url,
                  found: result.found,
                  napData: result.napData,
                  nameMatch: compareNAPField(canonicalNAP.name, result.napData?.name),
                  addressMatch: compareNAPField(canonicalNAP.address, result.napData?.address),
                  phoneMatch: compareNAPField(canonicalNAP.phone, result.napData?.phone),
                };

                return directoryResult;
              } catch (error) {
                return {
                  directoryName: directory.name,
                  found: false,
                  nameMatch: "missing" as const,
                  addressMatch: "missing" as const,
                  phoneMatch: "missing" as const,
                };
              }
            })
          );

          const directoryResults: DirectoryResult[] = directoryChecks.map((result, index) => {
            if (result.status === "fulfilled") {
              return result.value;
            }
            return {
              directoryName: DIRECTORIES[index].name,
              found: false,
              nameMatch: "missing" as const,
              addressMatch: "missing" as const,
              phoneMatch: "missing" as const,
            };
          });

          const summary = directoryResults.reduce(
            (acc, result) => {
              acc.totalDirectories++;
              
              if (!result.found) {
                acc.missing++;
              } else {
                const hasInconsistency = 
                  result.nameMatch === "inconsistent" ||
                  result.addressMatch === "inconsistent" ||
                  result.phoneMatch === "inconsistent";
                
                if (hasInconsistency) {
                  acc.inconsistent++;
                } else {
                  acc.consistent++;
                }
              }
              
              return acc;
            },
            { totalDirectories: 0, consistent: 0, inconsistent: 0, missing: 0 }
          );

          const savedCheck = await storage.createNAPCheckWithResults(
            {
              firmName,
              location,
              canonicalName: canonicalNAP.name,
              canonicalAddress: canonicalNAP.address,
              canonicalPhone: canonicalNAP.phone,
              googlePlacesId: placeId,
              totalDirectories: summary.totalDirectories,
              consistentCount: summary.consistent,
              inconsistentCount: summary.inconsistent,
              missingCount: summary.missing,
              batchId: batch.id,
              monitoringEnabled: false,
              monitoringFrequency: null,
            },
            directoryResults.map((result) => ({
              checkId: 0,
              directoryName: result.directoryName,
              directoryUrl: result.directoryUrl || null,
              found: result.found,
              napData: result.napData || null,
              nameMatch: result.nameMatch,
              addressMatch: result.addressMatch,
              phoneMatch: result.phoneMatch,
            }))
          );

          checkIds.push(savedCheck.id);
        } catch (error) {
          console.error(`Failed to check ${firmName}:`, error);
        }
      }

      const updatedBatch = await storage.updateBatchCheck(batch.id, {
        completedAt: new Date(),
        status: "completed",
        totalFirms: firms.length,
        completedFirms: checkIds.length,
      });

      res.json({ batch: updatedBatch, checkIds });
    } catch (error) {
      console.error("Batch check error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to process batch check" 
      });
    }
  });

  app.get("/api/batches", async (req, res) => {
    try {
      const batches = await storage.getAllBatchChecks();
      res.json(batches);
    } catch (error) {
      console.error("Get batches error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to fetch batches" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
