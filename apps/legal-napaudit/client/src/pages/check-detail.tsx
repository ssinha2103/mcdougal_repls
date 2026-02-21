import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Building2, MapPin, Calendar, Phone, MapPinned } from "lucide-react";
import { DirectoryTable } from "@/components/directory-table";
import { SummaryCards } from "@/components/summary-cards";
import { ConsistencyChart } from "@/components/consistency-chart";
import type { NAPCheck, DirectoryResultRow } from "@shared/schema";
import { format } from "date-fns";

interface CheckDetailResponse {
  check: NAPCheck;
  directoryResults: DirectoryResultRow[];
}

export default function CheckDetail() {
  const [, params] = useRoute("/check/:id");
  const checkId = params?.id;

  const { data, isLoading, error } = useQuery<CheckDetailResponse>({
    queryKey: ["/api/checks", checkId],
    enabled: !!checkId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-96" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Check</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {error instanceof Error ? error.message : "Check not found"}
                </p>
                <Button asChild variant="outline">
                  <Link href="/history">Back to History</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { check, directoryResults } = data;
  
  const canonicalNAP = {
    name: check.canonicalName,
    address: check.canonicalAddress,
    phone: check.canonicalPhone,
  };

  const transformedResults = directoryResults.map((result) => ({
    directoryName: result.directoryName,
    directoryUrl: result.directoryUrl || undefined,
    found: result.found,
    napData: result.napData as { name: string; address: string; phone: string } | undefined,
    nameMatch: result.nameMatch as "consistent" | "inconsistent" | "missing",
    addressMatch: result.addressMatch as "consistent" | "inconsistent" | "missing",
    phoneMatch: result.phoneMatch as "consistent" | "inconsistent" | "missing",
  }));

  const summary = {
    totalDirectories: check.totalDirectories,
    consistent: check.consistentCount,
    inconsistent: check.inconsistentCount,
    missing: check.missingCount,
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="sm" data-testid="button-back">
              <Link href="/history">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold" data-testid="text-firm-name">
                {check.firmName}
              </h1>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {check.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(check.checkedAt), "MMM dd, yyyy 'at' h:mm a")}
              </span>
            </div>
          </div>

          <SummaryCards summary={summary} />

          <Card>
            <CardHeader>
              <CardTitle>Canonical NAP Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Business Name</div>
                  <div className="font-medium" data-testid="text-canonical-name">
                    {canonicalNAP.name}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPinned className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Address</div>
                  <div className="font-medium" data-testid="text-canonical-address">
                    {canonicalNAP.address}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Phone Number</div>
                  <div className="font-medium" data-testid="text-canonical-phone">
                    {canonicalNAP.phone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ConsistencyChart 
            consistent={summary.consistent}
            inconsistent={summary.inconsistent}
            missing={summary.missing}
          />

          <DirectoryTable 
            directoryResults={transformedResults}
            canonicalNAP={canonicalNAP}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
