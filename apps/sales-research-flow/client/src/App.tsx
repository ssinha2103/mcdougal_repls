import { Router as WouterRouter, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { NavigationHeader } from "@/components/navigation-header";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function resolveBasePath() {
  if (typeof window === "undefined") return "";

  const segments = window.location.pathname.split("/").filter(Boolean);
  return segments.length > 0 ? `/${segments[0]}` : "";
}

const basePath = resolveBasePath();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="seo-dashboard-theme">
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <NavigationHeader />
            <main className="container mx-auto px-6 py-8">
              <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
