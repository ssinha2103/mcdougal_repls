import { Scale, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface HeaderProps {
  onNewSearch?: () => void;
  hasResults?: boolean;
}

export function Header({ onNewSearch, hasResults }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Legal NAP Checker</span>
        </div>
        
        <div className="flex items-center gap-2">
          {hasResults && (
            <Button 
              onClick={onNewSearch} 
              variant="outline"
              data-testid="button-new-search"
            >
              New Search
            </Button>
          )}
          <Button 
            asChild
            variant="outline"
            data-testid="button-history"
          >
            <Link href="/history">
              <History className="h-4 w-4 mr-2" />
              History
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
