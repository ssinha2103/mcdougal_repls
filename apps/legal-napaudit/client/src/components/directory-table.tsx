import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DirectoryResult, NAPData } from "@shared/schema";
import { DirectoryDetailDialog } from "@/components/directory-detail-dialog";

interface DirectoryTableProps {
  directoryResults: DirectoryResult[];
  canonicalNAP: NAPData;
}

export function DirectoryTable({ directoryResults, canonicalNAP }: DirectoryTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [selectedDirectory, setSelectedDirectory] = useState<DirectoryResult | null>(null);

  const getStatusIcon = (status: "consistent" | "inconsistent" | "missing") => {
    switch (status) {
      case "consistent":
        return <CheckCircle2 className="h-4 w-4 text-chart-2" />;
      case "inconsistent":
        return <XCircle className="h-4 w-4 text-chart-4" />;
      case "missing":
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (result: DirectoryResult) => {
    if (!result.found) {
      return <Badge variant="outline">Not Found</Badge>;
    }
    
    const hasInconsistency = 
      result.nameMatch === "inconsistent" || 
      result.addressMatch === "inconsistent" || 
      result.phoneMatch === "inconsistent";
    
    if (hasInconsistency) {
      return <Badge variant="destructive">Inconsistent</Badge>;
    }
    
    return <Badge className="bg-chart-2 text-white hover:bg-chart-2/90">Consistent</Badge>;
  };

  const toggleRow = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <>
      <Card className="overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold">Directory Listings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click on any row to view detailed comparison
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Directory</TableHead>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Address</TableHead>
                <TableHead className="text-center">Phone</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {directoryResults.map((result, index) => (
                <TableRow 
                  key={index}
                  className="hover-elevate cursor-pointer"
                  onClick={() => toggleRow(index)}
                  data-testid={`row-directory-${index}`}
                >
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(index);
                      }}
                    >
                      {expandedRow === index ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{result.directoryName}</span>
                      {result.directoryUrl && (
                        <a
                          href={result.directoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusIcon(result.nameMatch)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusIcon(result.addressMatch)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusIcon(result.phoneMatch)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getStatusBadge(result)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDirectory(result);
                      }}
                      data-testid={`button-view-details-${index}`}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {selectedDirectory && (
        <DirectoryDetailDialog
          directory={selectedDirectory}
          canonicalNAP={canonicalNAP}
          open={!!selectedDirectory}
          onOpenChange={(open) => !open && setSelectedDirectory(null)}
        />
      )}
    </>
  );
}
