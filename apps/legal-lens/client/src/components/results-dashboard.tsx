import { useState } from "react";
import { type AnalysisResponse } from "@shared/schema";
import { StatsOverview } from "./stats-overview";
import { LocalPackTable } from "./local-pack-table";
import { OrganicResultsTable } from "./organic-results-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { exportToPDF, exportToCSV } from "@/lib/export";

interface ResultsDashboardProps {
  data: AnalysisResponse;
}

export function ResultsDashboard({ data }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState("local");

  // Defensive check for data integrity
  if (!data || !data.summary) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">No analysis data available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl">Competitive Analysis Results</CardTitle>
              <CardDescription className="mt-1.5">
                Analysis for <span className="font-semibold text-foreground">{data.keyword}</span> in{" "}
                <span className="font-semibold text-foreground">{data.location}</span>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToPDF(data)}
                data-testid="button-export-pdf"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(data)}
                data-testid="button-export-csv"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StatsOverview
            totalResults={data.summary?.totalResults ?? 0}
            avgRating={data.summary?.avgRating}
            claimedPercentage={data.summary?.claimedPercentage}
            topCompetitor={data.summary?.topCompetitor}
          />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="local" data-testid="tab-local-pack">
            Local Pack ({data.localPack.length})
          </TabsTrigger>
          <TabsTrigger value="organic" data-testid="tab-organic">
            Organic ({data.organic.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="local" className="mt-6">
          <LocalPackTable results={data.localPack} />
        </TabsContent>
        <TabsContent value="organic" className="mt-6">
          <OrganicResultsTable results={data.organic} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
