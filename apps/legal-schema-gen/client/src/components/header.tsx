import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold tracking-tight">Schema Markup Generator</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">For Legal Services</p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden md:flex text-xs">
              Trusted by 500+ Law Firms
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              data-testid="link-documentation"
            >
              <a href="https://schema.org/LegalService" target="_blank" rel="noopener noreferrer">
                Documentation
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
