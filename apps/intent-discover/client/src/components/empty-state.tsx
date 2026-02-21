import { Search, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative mb-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Search className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-success">
          <Sparkles className="h-4 w-4 text-success-foreground" />
        </div>
      </div>
      <h3 className="mb-2 text-xl font-semibold">Discover User Intent</h3>
      <p className="mb-6 max-w-md text-sm text-muted-foreground">
        Enter a keyword to extract Google's "People Also Ask" questions and Related Searches.
        Perfect for content research and understanding what your audience wants to know.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span>PAA Questions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-info" />
          <span>Related Searches</span>
        </div>
      </div>
    </div>
  );
}
