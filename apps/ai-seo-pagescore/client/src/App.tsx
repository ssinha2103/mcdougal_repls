import { Router as WouterRouter, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SeoAnalysis from "@/pages/seo-analysis";
import Help from "@/pages/help";
import Contact from "@/pages/contact";
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
      <Route path="/" component={SeoAnalysis} />
      <Route path="/help" component={Help} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
