import { Link2 } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Link2 className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2" data-testid="text-empty-state-title">
        No results yet
      </h3>
      <p className="text-muted-foreground max-w-md" data-testid="text-empty-state-description">
        Enter a URL above to analyze all outbound links on that page. We'll check each link's status and identify any broken links or redirects.
      </p>
    </div>
  );
}
