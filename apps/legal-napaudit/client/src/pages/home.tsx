import { useState } from "react";
import { SearchForm } from "@/components/search-form";
import { ResultsDashboard } from "@/components/results-dashboard";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Download, CheckCircle2, Clock } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { NAPCheckResponse, BatchCheck } from "@shared/schema";
import Papa from "papaparse";

interface FirmEntry {
  id: string;
  firmName: string;
  location: string;
}

export default function Home() {
  const { toast } = useToast();
  const [results, setResults] = useState<NAPCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("single");
  const [firms, setFirms] = useState<FirmEntry[]>([]);
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [manualFirmName, setManualFirmName] = useState("");
  const [manualLocation, setManualLocation] = useState("");

  const handleSearchComplete = (data: NAPCheckResponse) => {
    setResults(data);
    setIsLoading(false);
  };

  const handleSearchStart = () => {
    setIsLoading(true);
    setResults(null);
  };

  const handleSearchError = () => {
    setIsLoading(false);
  };

  const handleNewSearch = () => {
    setResults(null);
    setIsLoading(false);
  };

  const createBatchMutation = useMutation({
    mutationFn: async (firmsList: FirmEntry[]) => {
      return await apiRequest<{ batch: BatchCheck; checkIds: number[] }>(
        "POST",
        "/api/batch-check",
        { firms: firmsList.map(f => ({ firmName: f.firmName, location: f.location })) }
      );
    },
    onSuccess: (data) => {
      toast({
        title: "Batch Complete",
        description: `Successfully processed ${data.batch.completedFirms} of ${data.batch.totalFirms} law firms`,
      });
      setFirms([]);
      setCSVFile(null);
      setManualFirmName("");
      setManualLocation("");
      queryClient.invalidateQueries({ queryKey: ["/api/batches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/checks"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Batch Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCSVFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedFirms: FirmEntry[] = [];
        
        for (const row of results.data as any[]) {
          const firmName = 
            row["Firm Name"] || 
            row["firmName"] || 
            row["FirmName"] ||
            row["firm name"] ||
            row["name"] || 
            row["Name"] ||
            row["Firm"] ||
            row["firm"] ||
            row["Company"] ||
            row["company"];
            
          const location = 
            row["Location"] || 
            row["location"] ||
            row["City"] ||
            row["city"] ||
            row["Address"] ||
            row["address"];
          
          if (firmName && location) {
            parsedFirms.push({
              id: Math.random().toString(36).substr(2, 9),
              firmName: firmName.trim(),
              location: location.trim(),
            });
          }
        }
        
        if (parsedFirms.length > 0) {
          setFirms(parsedFirms);
          toast({
            title: "CSV Loaded",
            description: `Found ${parsedFirms.length} law firms`,
          });
        } else {
          toast({
            title: "Invalid CSV",
            description: "Please ensure your CSV has 'Firm Name' and 'Location' columns",
            variant: "destructive",
          });
        }
      },
      error: (error) => {
        toast({
          title: "CSV Parse Error",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleAddManualEntry = () => {
    if (!manualFirmName.trim() || !manualLocation.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both firm name and location",
        variant: "destructive",
      });
      return;
    }

    setFirms([...firms, {
      id: Math.random().toString(36).substr(2, 9),
      firmName: manualFirmName,
      location: manualLocation,
    }]);
    setManualFirmName("");
    setManualLocation("");
  };

  const handleRemoveFirm = (id: string) => {
    setFirms(firms.filter(f => f.id !== id));
  };

  const handleStartBatch = () => {
    if (firms.length === 0) {
      toast({
        title: "No Firms Added",
        description: "Please add at least one law firm to check",
        variant: "destructive",
      });
      return;
    }

    createBatchMutation.mutate(firms);
  };

  const downloadSampleCSV = () => {
    const csv = `Firm Name,Location
"Smith & Associates Law","Chicago, IL"
"Jones Legal Group","New York, NY"
"Brown Law Firm","Los Angeles, CA"`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-batch.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header onNewSearch={handleNewSearch} hasResults={!!results} />
      
      <main className="flex-1 w-full">
        {!results && !isLoading && (
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12" data-testid="tabs-analysis">
                <TabsTrigger value="single" data-testid="tab-single-analysis">Single Analysis</TabsTrigger>
                <TabsTrigger value="bulk" data-testid="tab-bulk-analysis">Bulk Analysis</TabsTrigger>
              </TabsList>

              <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                  Legal Directory NAP Consistency Checker
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {activeTab === "single" 
                    ? "Verify your law firm's Name, Address, and Phone (NAP) consistency across major legal directories. Inconsistent listings hurt your local SEO rankings."
                    : "Check multiple law firm locations at once. Upload a CSV file or manually enter firms to analyze NAP consistency in bulk."}
                </p>
              </div>

              <TabsContent value="single" className="space-y-8">
                <SearchForm 
                  onSearchStart={handleSearchStart}
                  onSearchComplete={handleSearchComplete}
                  onSearchError={handleSearchError}
                />
                <EmptyState />
              </TabsContent>

              <TabsContent value="bulk" className="space-y-6">
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Upload CSV or Add Manually</CardTitle>
                    <CardDescription>
                      Upload a CSV file with firm names and locations, or add firms one by one
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="csv-upload">Upload CSV File</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleCSVUpload}
                            data-testid="input-csv-file"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={downloadSampleCSV}
                            data-testid="button-download-sample"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Sample
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          CSV should have columns: Firm Name, Location
                        </p>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or add manually</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="manual-firm-name">Law Firm Name</Label>
                          <Input
                            id="manual-firm-name"
                            placeholder="Smith & Associates Law"
                            value={manualFirmName}
                            onChange={(e) => setManualFirmName(e.target.value)}
                            autoComplete="organization"
                            data-testid="input-manual-firm-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="manual-location">Location</Label>
                          <Input
                            id="manual-location"
                            placeholder="Chicago, IL"
                            value={manualLocation}
                            onChange={(e) => setManualLocation(e.target.value)}
                            autoComplete="address-level2"
                            data-testid="input-manual-location"
                          />
                        </div>
                        <Button
                          onClick={handleAddManualEntry}
                          variant="outline"
                          className="w-full"
                          data-testid="button-add-firm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Firm
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {firms.length > 0 && (
                  <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Firms to Check ({firms.length})</span>
                        <Button
                          onClick={handleStartBatch}
                          disabled={createBatchMutation.isPending}
                          data-testid="button-start-batch"
                        >
                          {createBatchMutation.isPending ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Start Batch Check
                            </>
                          )}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {firms.map((firm, index) => (
                          <div
                            key={firm.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                            data-testid={`firm-entry-${index}`}
                          >
                            <div className="flex-1">
                              <p className="font-medium">{firm.firmName}</p>
                              <p className="text-sm text-muted-foreground">{firm.location}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFirm(firm.id)}
                              data-testid={`button-remove-${index}`}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {isLoading && (
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Legal Directory NAP Consistency Checker
              </h1>
            </div>
            <SearchForm 
              onSearchStart={handleSearchStart}
              onSearchComplete={handleSearchComplete}
              onSearchError={handleSearchError}
              isLoading={isLoading}
            />
          </div>
        )}

        {results && !isLoading && (
          <div className="w-full">
            <ResultsDashboard results={results} onNewSearch={handleNewSearch} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
