import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Download, FileArchive, FileSpreadsheet, File } from "lucide-react";

export default function Exports() {
  // Mock exports data - will be replaced with real data from backend
  const exports: any[] = [];

  if (exports.length === 0) {
    return (
      <EmptyState
        icon={Download}
        title="No exports yet"
        description="Export data will appear here once you generate ZIP archives, CSV reports, or PDF summaries."
        action={{
          label: "Go to Dashboard",
          onClick: () => window.location.href = "/",
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Exports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Download and manage your exported data
        </p>
      </div>

      {/* Exports List */}
      <div className="space-y-3">
        {exports.map((exp) => (
          <Card key={exp.id} className="p-4 hover-elevate">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                  {exp.type === "zip" && <FileArchive className="h-5 w-5 text-muted-foreground" />}
                  {exp.type === "csv" && <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />}
                  {exp.type === "pdf" && <File className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{exp.name}</h3>
                  <p className="text-xs text-muted-foreground">{exp.size} • {exp.createdAt}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" data-testid="button-download-export">
                <Download className="h-3 w-3 mr-1.5" />
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
