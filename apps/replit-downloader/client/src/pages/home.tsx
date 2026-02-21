import { useState, useRef, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { downloadRequestSchema, type DownloadRequest, type Download } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Download as DownloadIcon,
  Loader2,
  Code2,
  FolderDown,
  Clock,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Upload,
  FileSpreadsheet,
  Package,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ParsedUrl {
  url: string;
  username: string;
  replName: string;
  appName?: string;
  valid: boolean;
}

function HeroSection() {
  return (
    <div className="text-center space-y-4 py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-md bg-primary/10 mb-2">
        <Code2 className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Replit Code Downloader
      </h1>
      <p className="text-muted-foreground max-w-md mx-auto text-base">
        Download source code from public Replit projects. Paste a single link or upload a CSV for bulk downloads.
      </p>
    </div>
  );
}

function DownloadForm() {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const form = useForm<DownloadRequest>({
    resolver: zodResolver(downloadRequestSchema),
    defaultValues: { url: "" },
  });

  const downloadMutation = useMutation({
    mutationFn: async (data: DownloadRequest) => {
      setDownloading(true);
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData.message || "Download failed");
      }

      const contentDisposition = res.headers.get("content-disposition");
      let filename = "replit-project.zip";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+?)"?$/);
        if (match) filename = match[1];
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { filename };
    },
    onSuccess: ({ filename }) => {
      setDownloading(false);
      toast({
        title: "Download started",
        description: `${filename} is downloading to your computer.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
      form.reset();
    },
    onError: (error: Error) => {
      setDownloading(false);
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: DownloadRequest) => {
    downloadMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex gap-3 flex-wrap">
                  <Input
                    data-testid="input-replit-url"
                    placeholder="https://replit.com/t/team-name/repls/project-name"
                    className="flex-1 min-w-0"
                    {...field}
                    disabled={downloading}
                  />
                  <Button
                    data-testid="button-download"
                    type="submit"
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FolderDown className="w-4 h-4" />
                    )}
                    <span className="ml-2">
                      {downloading ? "Downloading..." : "Download ZIP"}
                    </span>
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

function BulkUpload() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedUrls, setParsedUrls] = useState<ParsedUrl[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [parsing, setParsing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    const validExts = [".csv", ".txt", ".xlsx", ".xls"];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV, Excel (.xlsx), or TXT file.",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    setSelectedFile(file);
    setParsing(true);
    setParsedUrls([]);

    const formData = new FormData();
    formData.append("csv", file);

    try {
      const res = await fetch("/api/parse-csv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Parse failed" }));
        throw new Error(err.message);
      }

      const data = await res.json();
      setParsedUrls(data.urls);

      if (data.total === 0) {
        toast({
          title: "No URLs found",
          description: "No valid Replit URLs were found in the file.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Failed to parse file",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleBulkDownload = async () => {
    if (!selectedFile || parsedUrls.length === 0) return;

    setDownloading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append("csv", selectedFile);

    try {
      setProgress(30);

      const res = await fetch("/api/bulk-download", {
        method: "POST",
        body: formData,
      });

      setProgress(70);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Bulk download failed" }));
        throw new Error(err.message);
      }

      setProgress(90);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `replit-bulk-download.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setProgress(100);
      toast({
        title: "Bulk download complete",
        description: `Downloaded ${parsedUrls.filter(u => u.valid).length} projects as a single ZIP.`,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/downloads"] });
    } catch (err: any) {
      toast({
        title: "Bulk download failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  const validCount = parsedUrls.filter((u) => u.valid).length;

  return (
    <div className="space-y-4">
      <div
        data-testid="dropzone-csv"
        className="border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer transition-colors hover:border-primary/50"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.xlsx,.xls"
          className="hidden"
          data-testid="input-csv-file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
        {parsing ? (
          <div className="space-y-2">
            <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
            <p className="text-sm text-muted-foreground">Parsing your file...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium">
              {fileName ? fileName : "Drop your file here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              Excel (.xlsx) or CSV with "App Name" and "Creator Username" columns, or files with Replit URLs (max 50)
            </p>
          </div>
        )}
      </div>

      {parsedUrls.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium" data-testid="text-urls-found">
                {validCount} valid {validCount === 1 ? "URL" : "URLs"} found
              </span>
              {parsedUrls.length !== validCount && (
                <Badge variant="secondary" className="text-xs">
                  {parsedUrls.length - validCount} invalid
                </Badge>
              )}
            </div>
            <Button
              data-testid="button-bulk-download"
              onClick={handleBulkDownload}
              disabled={downloading || validCount === 0}
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Package className="w-4 h-4" />
              )}
              <span className="ml-2">
                {downloading ? "Downloading..." : `Download All (${validCount})`}
              </span>
            </Button>
          </div>

          {downloading && progress > 0 && (
            <Progress value={progress} className="h-2" data-testid="progress-bulk" />
          )}

          <div className="max-h-48 overflow-y-auto space-y-1.5">
            {parsedUrls.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm py-1.5 px-3 rounded-md bg-muted/50"
                data-testid={`row-url-${idx}`}
              >
                {item.valid ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 dark:text-green-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                )}
                <span className="font-medium truncate">{item.appName || item.replName}</span>
                <span className="text-muted-foreground text-xs truncate">@{item.username}</span>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            data-testid="button-clear-csv"
            onClick={() => {
              setParsedUrls([]);
              setFileName("");
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}

function HistoryList() {
  const { data: downloads, isLoading } = useQuery<Download[]>({
    queryKey: ["/api/downloads"],
  });

  if (isLoading) {
    return (
      <div className="space-y-3 mt-8">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Recent Downloads
        </h2>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!downloads || downloads.length === 0) {
    return (
      <div className="mt-8 text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-muted mb-3">
          <DownloadIcon className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm" data-testid="text-empty-state">
          No downloads yet. Paste a Replit link above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-8">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        Recent Downloads
      </h2>
      {downloads.map((dl) => (
        <Card
          key={dl.id}
          className="p-4 hover-elevate"
          data-testid={`card-download-${dl.id}`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10 shrink-0">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm truncate" data-testid={`text-repl-name-${dl.id}`}>
                  {dl.replName}
                </span>
                <Badge variant="secondary" className="text-xs">
                  @{dl.username}
                </Badge>
                {dl.status === "completed" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 dark:text-green-400 shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(dl.downloadedAt), { addSuffix: true })}
              </p>
            </div>
            <a
              href={dl.replitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
              data-testid={`link-replit-${dl.id}`}
            >
              <Button variant="ghost" size="icon">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </Card>
      ))}
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { title: "Paste Link", desc: "Copy any public Replit project URL" },
    { title: "Click Download", desc: "We fetch and package the code" },
    { title: "Get ZIP", desc: "Save the ZIP file to your computer" },
  ];

  return (
    <div className="mt-10">
      <h2 className="text-lg font-semibold text-center mb-4">How It Works</h2>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <Card className="p-4 text-center w-44">
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-2">
                {i + 1}
              </div>
              <p className="font-medium text-sm">{step.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
            </Card>
            {i < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <HeroSection />
        <Card className="p-6">
          <Tabs defaultValue="single">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="single" className="flex-1" data-testid="tab-single">
                <FolderDown className="w-4 h-4 mr-2" />
                Single Download
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex-1" data-testid="tab-bulk">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Bulk Download
              </TabsTrigger>
            </TabsList>
            <TabsContent value="single">
              <DownloadForm />
            </TabsContent>
            <TabsContent value="bulk">
              <BulkUpload />
            </TabsContent>
          </Tabs>
        </Card>
        <HistoryList />
        <HowItWorks />
      </div>
    </div>
  );
}
