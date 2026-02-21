import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, XCircle, Download, Calendar } from "lucide-react";
import { CanonicalNAPCard } from "@/components/canonical-nap-card";
import { DirectoryTable } from "@/components/directory-table";
import { ConsistencyChart } from "@/components/consistency-chart";
import { ExportButtons } from "@/components/export-buttons";
import type { NAPCheckResponse } from "@shared/schema";

interface ResultsDashboardProps {
  results: NAPCheckResponse;
  onNewSearch: () => void;
}

export function ResultsDashboard({ results }: ResultsDashboardProps) {
  if (!results || !results.summary) {
    console.error("ResultsDashboard: Invalid results data", results);
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">No results data available</p>
        </Card>
      </div>
    );
  }

  const { summary, checkedAt } = results;
  const consistencyPercentage = summary.totalDirectories > 0
    ? Math.round((summary.consistent / summary.totalDirectories) * 100)
    : 0;

  return (
    <div className="w-full bg-muted/30">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">NAP Consistency Report</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Checked on {new Date(checkedAt).toLocaleString()}</span>
            </div>
          </div>
          <ExportButtons results={results} />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Directories</p>
                <p className="text-3xl font-bold text-foreground mt-2" data-testid="text-total-directories">
                  {summary.totalDirectories}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Download className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consistent Listings</p>
                <p className="text-3xl font-bold text-chart-2 mt-2" data-testid="text-consistent-count">
                  {summary.consistent}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inconsistencies Found</p>
                <p className="text-3xl font-bold text-chart-4 mt-2" data-testid="text-inconsistent-count">
                  {summary.inconsistent}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-chart-4" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CanonicalNAPCard napData={results.canonicalNAP} />
          </div>
          <div>
            <ConsistencyChart 
              consistent={summary.consistent}
              inconsistent={summary.inconsistent}
              missing={summary.missing}
            />
          </div>
        </div>

        <DirectoryTable directoryResults={results.directoryResults} canonicalNAP={results.canonicalNAP} />

        {summary.inconsistent > 0 && (
          <Card className="p-6 bg-chart-3/5 border-chart-3/20">
            <div className="flex gap-4">
              <AlertCircle className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-2">Action Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We found {summary.inconsistent} {summary.inconsistent === 1 ? 'directory' : 'directories'} with 
                  inconsistent NAP information. These inconsistencies can negatively impact your local SEO rankings. 
                  Click on each directory below to see the exact differences and update your listings accordingly.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
