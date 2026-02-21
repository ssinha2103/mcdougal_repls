import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Upload, Plus, X, Download, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { NAPCheck, BatchCheck } from "@shared/schema";
import Papa from "papaparse";

interface FirmEntry {
  id: string;
  firmName: string;
  location: string;
}

export default function BatchCheckPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [firms, setFirms] = useState<FirmEntry[]>([]);
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [manualFirmName, setManualFirmName] = useState("");
  const [manualLocation, setManualLocation] = useState("");
  const [currentBatchId, setCurrentBatchId] = useState<number | null>(null);

  const { data: batches } = useQuery<BatchCheck[]>({
    queryKey: ["/api/batches"],
  });

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
      setCurrentBatchId(data.batch.id);
      setFirms([]);
      setCSVFile(null);
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
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid="text-batch-title">
                Batch NAP Check
              </h1>
              <p className="text-muted-foreground">
                Check multiple law firm locations at once
              </p>
            </div>
            <Button asChild variant="outline" data-testid="button-single-check">
              <Link href="/">Single Check</Link>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add Law Firms</CardTitle>
              <CardDescription>
                Upload a CSV file or manually enter multiple law firm locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="csv">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="csv" data-testid="tab-csv">CSV Upload</TabsTrigger>
                  <TabsTrigger value="manual" data-testid="tab-manual">Manual Entry</TabsTrigger>
                </TabsList>

                <TabsContent value="csv" className="space-y-4">
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
                        Sample CSV
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      CSV should have columns: Firm Name, Location
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {firms.length > 0 && (
            <Card>
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

          {batches && batches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Batch Checks</CardTitle>
                <CardDescription>View status of your batch operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {batches.slice(0, 5).map((batch) => {
                    const progress = batch.totalFirms > 0
                      ? (batch.completedFirms / batch.totalFirms) * 100
                      : 0;
                    const isComplete = batch.status === "completed";
                    const isPending = batch.status === "pending";

                    return (
                      <div key={batch.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {batch.name || `Batch #${batch.id}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {batch.completedFirms} / {batch.totalFirms} firms processed
                            </p>
                          </div>
                          <Badge variant={isComplete ? "default" : "secondary"}>
                            {batch.status}
                          </Badge>
                        </div>
                        <Progress value={progress} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
