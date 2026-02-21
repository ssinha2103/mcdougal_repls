import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Check, Code, FileJson, FileCode } from "lucide-react";
import { SchemaOutput } from "@shared/schema";
import { formatSchemaForDisplay, generateHTMLEmbed, generateWordPressSnippet } from "@/lib/schema-generator";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SchemaPreviewProps {
  schema: SchemaOutput | null;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

type ExportFormat = "json" | "html" | "wordpress";

export function SchemaPreview({ schema, isValid, errors, warnings }: SchemaPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json");
  const { toast } = useToast();

  const getFormattedContent = () => {
    if (!schema) return "";
    
    switch (exportFormat) {
      case "html":
        return generateHTMLEmbed(schema);
      case "wordpress":
        return generateWordPressSnippet(schema);
      default:
        return formatSchemaForDisplay(schema);
    }
  };

  const handleCopy = async () => {
    const content = getFormattedContent();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied to clipboard!",
        description: "Schema markup has been copied successfully.",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const content = getFormattedContent();
    const extension = exportFormat === "wordpress" ? "php" : exportFormat === "html" ? "html" : "json";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `legal-service-schema.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started!",
      description: `Schema file downloaded as ${extension.toUpperCase()}.`,
    });
  };

  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold tracking-tight">Schema Preview</h3>
            {isValid ? (
              <Badge variant="default" className="bg-chart-2 hover:bg-chart-2" data-testid="badge-schema-valid">
                <Check className="h-3 w-3 mr-1" />
                Valid
              </Badge>
            ) : (
              <Badge variant="destructive" data-testid="badge-schema-invalid">
                Incomplete
              </Badge>
            )}
          </div>

          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4" data-testid="container-schema-errors">
              <h4 className="text-sm font-medium text-destructive mb-2">Required Fields:</h4>
              <ul className="text-sm text-destructive/90 space-y-1">
                {errors.map((error, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-destructive">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && errors.length === 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4" data-testid="container-schema-warnings">
              <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">Recommendations:</h4>
              <ul className="text-sm text-amber-600 dark:text-amber-300 space-y-1">
                {warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
                <SelectTrigger className="w-[180px]" data-testid="select-export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="h-4 w-4" />
                      JSON-LD
                    </div>
                  </SelectItem>
                  <SelectItem value="html">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      HTML Embed
                    </div>
                  </SelectItem>
                  <SelectItem value="wordpress">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      WordPress
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  disabled={!schema}
                  data-testid="button-copy-schema"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  disabled={!schema}
                  data-testid="button-download-schema"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>

            <div className="relative">
              <pre className="bg-muted/50 border rounded-lg p-4 text-sm font-mono overflow-x-auto max-h-[600px] overflow-y-auto" data-testid="preview-schema-code">
                <code className="text-foreground">
                  {schema ? getFormattedContent() : "// Fill out the form to generate schema markup..."}
                </code>
              </pre>
            </div>
          </div>

          {isValid && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Next Steps:</strong> Copy the schema markup above and paste it in the{" "}
                <code className="bg-muted px-1 py-0.5 rounded">&lt;head&gt;</code> section of your website's HTML,
                or use the WordPress snippet in your theme's functions.php file.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
