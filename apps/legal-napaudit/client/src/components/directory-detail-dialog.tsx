import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DirectoryResult, NAPData } from "@shared/schema";

interface DirectoryDetailDialogProps {
  directory: DirectoryResult;
  canonicalNAP: NAPData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DirectoryDetailDialog({
  directory,
  canonicalNAP,
  open,
  onOpenChange,
}: DirectoryDetailDialogProps) {
  const getComparisonRow = (
    label: string,
    canonicalValue: string,
    directoryValue: string | undefined,
    match: "consistent" | "inconsistent" | "missing"
  ) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">{label}</h4>
          <div className="flex items-center gap-2">
            {match === "consistent" && (
              <>
                <CheckCircle2 className="h-4 w-4 text-chart-2" />
                <Badge className="bg-chart-2 text-white hover:bg-chart-2/90">Consistent</Badge>
              </>
            )}
            {match === "inconsistent" && (
              <>
                <XCircle className="h-4 w-4 text-chart-4" />
                <Badge variant="destructive">Inconsistent</Badge>
              </>
            )}
            {match === "missing" && (
              <>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">Missing</Badge>
              </>
            )}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              Google Places (Canonical)
            </label>
            <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
              <p className="text-sm font-mono break-all">{canonicalValue}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase">
              {directory.directoryName}
            </label>
            <div
              className={`p-3 rounded-md ${
                match === "inconsistent"
                  ? "bg-chart-4/5 border border-chart-4/20"
                  : match === "missing"
                  ? "bg-muted/50 border border-border"
                  : "bg-chart-2/5 border border-chart-2/20"
              }`}
            >
              <p className="text-sm font-mono break-all">
                {directoryValue || "Not found"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {directory.directoryName}
            {directory.directoryUrl && (
              <a
                href={directory.directoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </DialogTitle>
          <DialogDescription>
            Detailed comparison of NAP data between Google Places and this directory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {!directory.found ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Listing Not Found</h3>
              <p className="text-sm text-muted-foreground">
                We couldn't find a listing for this business on {directory.directoryName}.
                Consider claiming or creating your listing on this directory.
              </p>
            </div>
          ) : (
            <>
              {getComparisonRow(
                "Business Name",
                canonicalNAP.name,
                directory.napData?.name,
                directory.nameMatch
              )}
              
              {getComparisonRow(
                "Address",
                canonicalNAP.address,
                directory.napData?.address,
                directory.addressMatch
              )}
              
              {getComparisonRow(
                "Phone Number",
                canonicalNAP.phone,
                directory.napData?.phone,
                directory.phoneMatch
              )}

              {(directory.nameMatch === "inconsistent" ||
                directory.addressMatch === "inconsistent" ||
                directory.phoneMatch === "inconsistent") && (
                <div className="p-4 bg-chart-3/5 border border-chart-3/20 rounded-md">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-chart-3 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-2">Recommended Action</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Update your listing on {directory.directoryName} to match the canonical 
                        data from Google Places. Consistent NAP information across all directories 
                        improves your local SEO rankings.
                      </p>
                      {directory.directoryUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={directory.directoryUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Update Listing
                            <ExternalLink className="ml-2 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
