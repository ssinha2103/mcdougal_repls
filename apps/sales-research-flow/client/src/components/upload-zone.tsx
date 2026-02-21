import { useCallback } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function UploadZone({ onFileSelect, isProcessing = false }: UploadZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={cn(
        "border-2 border-dashed rounded-lg py-12 px-6 transition-colors",
        isProcessing
          ? "border-muted bg-muted/20 cursor-not-allowed"
          : "border-border hover:border-primary hover:bg-accent/50 cursor-pointer"
      )}
      data-testid="upload-zone"
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          {isProcessing ? (
            <FileSpreadsheet className="h-10 w-10 text-primary animate-pulse" />
          ) : (
            <Upload className="h-10 w-10 text-primary" />
          )}
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold mb-1">
            {isProcessing ? "Processing..." : "Drop your file here"}
          </p>
          <p className="text-sm text-muted-foreground mb-3">
            {isProcessing 
              ? "Enriching domains with SEMrush data" 
              : "or click to browse"}
          </p>
          {!isProcessing && (
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-sm font-medium text-primary hover:underline">
                Browse files
              </span>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileInput}
                disabled={isProcessing}
                data-testid="input-file-upload"
              />
            </label>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Supported formats: CSV, XLSX
          </p>
        </div>
      </div>
    </div>
  );
}
