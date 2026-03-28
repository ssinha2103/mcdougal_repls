import { Router as WouterRouter, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ContactPage from "@/pages/contact";
import ResultsPage from "@/pages/results-page";
import VerdictDetail from "@/pages/verdict-detail";
import AppellateDecisions from "@/pages/appellate-decisions";
import AppellateDecisionDetail from "@/pages/appellate-decision-detail";

function resolveBasePath() {
  if (typeof window === "undefined") return "";

  const segments = window.location.pathname.split("/").filter(Boolean);
  return segments.length > 0 ? `/${segments[0]}` : "";
}

const basePath = resolveBasePath();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/results" component={ResultsPage} />
      <Route path="/verdict/:id" component={VerdictDetail} />
      <Route path="/appellate-decisions" component={AppellateDecisions} />
      <Route path="/appellate-decision/:id" component={AppellateDecisionDetail} />
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
