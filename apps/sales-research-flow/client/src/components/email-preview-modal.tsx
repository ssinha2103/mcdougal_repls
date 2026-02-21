import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Download, Loader2, Mail, Eye } from "lucide-react";
import type { Domain } from "@shared/schema";

interface EmailPreviewModalProps {
  domain: Domain | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EmailOptions {
  ctaLink: string;
  senderName: string;
  senderCompany: string;
  competitorAvgKeywords: number;
}

export function EmailPreviewModal({ domain, open, onOpenChange }: EmailPreviewModalProps) {
  const { toast } = useToast();
  const [options, setOptions] = useState<EmailOptions>({
    ctaLink: "https://your-company.com/schedule",
    senderName: "Your SEO Team",
    senderCompany: "SEO Analytics Pro",
    competitorAvgKeywords: 150,
  });

  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);

  const generateEmailMutation = useMutation({
    mutationFn: async (format: "html" | "text") => {
      if (!domain) throw new Error("No domain selected");
      
      const response = await fetch(`/api/domains/${domain.id}/generate-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...options,
          format,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate email");
      }

      const data = await response.json();
      return { data, format };
    },
    onSuccess: ({ data, format }) => {
      if (format === "html" && data.html) {
        setGeneratedHtml(data.html);
      } else if (format === "text" && data.text) {
        setGeneratedText(data.text);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate email",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    setGeneratedHtml(null);
    setGeneratedText(null);
    generateEmailMutation.mutate("html");
    generateEmailMutation.mutate("text");
  };

  const handleCopyHtml = async () => {
    if (!generatedHtml) return;
    
    try {
      await navigator.clipboard.writeText(generatedHtml);
      toast({
        title: "Copied to clipboard",
        description: "HTML email template copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopyText = async () => {
    if (!generatedText) return;
    
    try {
      await navigator.clipboard.writeText(generatedText);
      toast({
        title: "Copied to clipboard",
        description: "Plain text email copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!generatedHtml || !domain) return;

    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${domain.companyName.replace(/[^a-z0-9]/gi, "_")}_email_template.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Downloaded",
      description: "Email template downloaded successfully",
    });
  };

  if (!domain) return null;

  const isGenerating = generateEmailMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col" data-testid="email-preview-modal">
        <DialogHeader>
          <DialogTitle>Generate Email Template</DialogTitle>
          <DialogDescription>
            Create a personalized email with SEO decline charts for {domain.companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-6">
          {/* Options Form */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaLink">CTA Link</Label>
              <Input
                id="ctaLink"
                value={options.ctaLink}
                onChange={(e) => setOptions({ ...options, ctaLink: e.target.value })}
                placeholder="https://your-company.com/schedule"
                data-testid="input-cta-link"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competitorAvg">Competitor Avg Keywords</Label>
              <Input
                id="competitorAvg"
                type="number"
                value={options.competitorAvgKeywords}
                onChange={(e) => setOptions({ ...options, competitorAvgKeywords: parseInt(e.target.value) || 0 })}
                placeholder="150"
                data-testid="input-competitor-keywords"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderName">Sender Name</Label>
              <Input
                id="senderName"
                value={options.senderName}
                onChange={(e) => setOptions({ ...options, senderName: e.target.value })}
                placeholder="Your SEO Team"
                data-testid="input-sender-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderCompany">Sender Company</Label>
              <Input
                id="senderCompany"
                value={options.senderCompany}
                onChange={(e) => setOptions({ ...options, senderCompany: e.target.value })}
                placeholder="SEO Analytics Pro"
                data-testid="input-sender-company"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2"
              data-testid="button-generate-email"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Generate Email
                </>
              )}
            </Button>

            {generatedHtml && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCopyHtml}
                  className="gap-2"
                  data-testid="button-copy-html"
                >
                  <Copy className="h-4 w-4" />
                  Copy HTML
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="gap-2"
                  data-testid="button-download"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </>
            )}
          </div>

          {/* Preview Tabs */}
          {(generatedHtml || generatedText) && (
            <Tabs defaultValue="preview" className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="preview" data-testid="tab-preview">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="html" data-testid="tab-html">
                  HTML
                </TabsTrigger>
                <TabsTrigger value="text" data-testid="tab-text">
                  Plain Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="flex-1 overflow-hidden mt-4">
                <ScrollArea className="h-[500px] rounded-md border border-border">
                  {generatedHtml && (
                    <div
                      className="p-4"
                      dangerouslySetInnerHTML={{ __html: generatedHtml }}
                      data-testid="email-preview-html"
                    />
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="html" className="flex-1 overflow-hidden mt-4">
                <ScrollArea className="h-[500px] rounded-md border border-border">
                  <pre className="p-4 text-xs">
                    <code data-testid="email-html-code">{generatedHtml}</code>
                  </pre>
                </ScrollArea>
                <Button
                  variant="outline"
                  onClick={handleCopyHtml}
                  className="gap-2 mt-2"
                  size="sm"
                >
                  <Copy className="h-3 w-3" />
                  Copy HTML
                </Button>
              </TabsContent>

              <TabsContent value="text" className="flex-1 overflow-hidden mt-4">
                <ScrollArea className="h-[500px] rounded-md border border-border">
                  <pre className="p-4 text-sm whitespace-pre-wrap">
                    <code data-testid="email-text-code">{generatedText}</code>
                  </pre>
                </ScrollArea>
                <Button
                  variant="outline"
                  onClick={handleCopyText}
                  className="gap-2 mt-2"
                  size="sm"
                >
                  <Copy className="h-3 w-3" />
                  Copy Text
                </Button>
              </TabsContent>
            </Tabs>
          )}

          {!generatedHtml && !isGenerating && (
            <div className="flex-1 flex items-center justify-center border border-dashed border-border rounded-lg">
              <div className="text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Generate Email" to create your personalized template</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
