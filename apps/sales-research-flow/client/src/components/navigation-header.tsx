import { BarChart3, Home, Activity, Download, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
];

export function NavigationHeader() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link 
            href="/" 
            className="flex items-center gap-3 hover-elevate px-3 py-2 rounded-md transition-colors" 
            data-testid="link-home"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-semibold leading-none">SEO Research Dashboard</h1>
              <p className="text-xs text-muted-foreground leading-none mt-1">
                Discover and manage your business prospects
              </p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate",
                    isActive 
                      ? "text-foreground bg-muted" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Theme Toggle */}
            <div className="ml-2 pl-2 border-l">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
