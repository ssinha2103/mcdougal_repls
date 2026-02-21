import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NAPData } from "@shared/schema";
import { useState } from "react";

interface CanonicalNAPCardProps {
  napData: NAPData;
}

export function CanonicalNAPCard({ napData }: CanonicalNAPCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Canonical NAP Data</h3>
          <p className="text-sm text-muted-foreground">From Google Places API</p>
        </div>
        <Badge variant="outline" className="ml-auto">
          Official Source
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="group">
          <label className="text-sm font-medium text-muted-foreground">Business Name</label>
          <div className="mt-1 flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50 hover-elevate">
            <span className="font-mono text-sm break-all" data-testid="text-canonical-name">
              {napData.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              onClick={() => copyToClipboard(napData.name, "name")}
              data-testid="button-copy-name"
            >
              {copiedField === "name" ? (
                <Check className="h-4 w-4 text-chart-2" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="group">
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <div className="mt-1 flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50 hover-elevate">
            <span className="font-mono text-sm break-all" data-testid="text-canonical-address">
              {napData.address}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              onClick={() => copyToClipboard(napData.address, "address")}
              data-testid="button-copy-address"
            >
              {copiedField === "address" ? (
                <Check className="h-4 w-4 text-chart-2" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="group">
          <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
          <div className="mt-1 flex items-center justify-between gap-2 p-3 rounded-md bg-muted/50 hover-elevate">
            <span className="font-mono text-sm" data-testid="text-canonical-phone">
              {napData.phone}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              onClick={() => copyToClipboard(napData.phone, "phone")}
              data-testid="button-copy-phone"
            >
              {copiedField === "phone" ? (
                <Check className="h-4 w-4 text-chart-2" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
