import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Upload, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface DomainUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (domains: string[], config: UploadConfig) => void;
}

export interface UploadConfig {
  database: string;
  runName?: string;
  maxRequestsPerHour: number;
  enableAI: boolean;
}

export function DomainUploadDialog({ open, onOpenChange, onSubmit }: DomainUploadDialogProps) {
  const [domainsText, setDomainsText] = useState("");
  const [database, setDatabase] = useState("us");
  const [runName, setRunName] = useState("");
  const [maxRequestsPerHour, setMaxRequestsPerHour] = useState(120);
  const [enableAI, setEnableAI] = useState(true);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      
      // Parse CSV and skip header row
      if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        // Skip first line if it looks like a header (contains "domain", "company", etc.)
        const firstLine = lines[0]?.toLowerCase() || '';
        const isHeader = firstLine.includes('domain') || 
                        firstLine.includes('company') || 
                        firstLine.includes('name') ||
                        firstLine.includes('url');
        
        const dataLines = isHeader ? lines.slice(1) : lines;
        
        // Extract first column from each line (domain column)
        const domains = dataLines.map(line => {
          // Handle CSV with quotes and commas
          const columns = line.split(',').map(col => col.replace(/^["']|["']$/g, '').trim());
          return columns[0]; // First column is the domain
        }).filter(d => d.length > 0);
        
        setDomainsText(domains.join('\n'));
      } else {
        setDomainsText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    const domains = domainsText
      .split(/[\n,]/)
      .map(d => d.trim())
      .filter(d => d.length > 0);

    if (domains.length === 0) {
      toast({
        title: "No domains provided",
        description: "Please enter at least one domain to crawl.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(domains, {
      database,
      runName: runName || undefined,
      maxRequestsPerHour,
      enableAI,
    });

    // Reset form
    setDomainsText("");
    setRunName("");
    onOpenChange(false);
  };

  const domainCount = domainsText
    .split(/[\n,]/)
    .map(d => d.trim())
    .filter(d => d.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-domain-upload">
        <DialogHeader>
          <DialogTitle>Upload Domains</DialogTitle>
          <DialogDescription>
            Enter domains to crawl from SEMrush. One per line or comma-separated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="file-upload" className="mb-2 block">
              Upload File (CSV/TXT/JSON)
            </Label>
            <div className="relative">
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.txt,.json"
                onChange={handleFileUpload}
                className="cursor-pointer"
                data-testid="input-file-upload"
              />
              <FileText className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Manual Entry */}
          <div>
            <Label htmlFor="domains-text" className="mb-2 block">
              Or Enter Manually
            </Label>
            <Textarea
              id="domains-text"
              placeholder="example.com&#10;another-site.com&#10;third-domain.org"
              value={domainsText}
              onChange={(e) => setDomainsText(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
              data-testid="textarea-domains"
            />
            {domainCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {domainCount} domain{domainCount !== 1 ? "s" : ""} detected
              </p>
            )}
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <Label htmlFor="run-name" className="mb-2 block">
                Run Name (Optional)
              </Label>
              <Input
                id="run-name"
                placeholder="Q1 2024 Prospects"
                value={runName}
                onChange={(e) => setRunName(e.target.value)}
                data-testid="input-run-name"
              />
            </div>

            <div>
              <Label htmlFor="database" className="mb-2 block">
                SEMrush Database
              </Label>
              <Select value={database} onValueChange={setDatabase}>
                <SelectTrigger id="database" data-testid="select-database">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                  <SelectItem value="au">Australia</SelectItem>
                  <SelectItem value="de">Germany</SelectItem>
                  <SelectItem value="fr">France</SelectItem>
                  <SelectItem value="es">Spain</SelectItem>
                  <SelectItem value="it">Italy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max-requests" className="mb-2 block">
                Max Requests/Hour
              </Label>
              <Input
                id="max-requests"
                type="number"
                min="10"
                max="300"
                value={maxRequestsPerHour}
                onChange={(e) => setMaxRequestsPerHour(parseInt(e.target.value) || 120)}
                data-testid="input-max-requests"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAI}
                  onChange={(e) => setEnableAI(e.target.checked)}
                  className="rounded border-border"
                  data-testid="checkbox-enable-ai"
                />
                <span className="text-sm">Enable AI Analysis</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={domainCount === 0} data-testid="button-start-crawl">
              <Upload className="h-4 w-4 mr-2" />
              Start Crawl
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
