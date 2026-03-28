import { Router as WouterRouter, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useWebSocket } from "@/hooks/use-websocket";
import Dashboard from "@/pages/Dashboard";
import RunsHistory from "@/pages/RunsHistory";
import Scheduler from "@/pages/Scheduler";
import Rankings from "@/pages/Rankings";
import Comparison from "@/pages/Comparison";
import Exports from "@/pages/Exports";
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
      <Route path="/runs" component={RunsHistory} />
      <Route path="/scheduler" component={Scheduler} />
      <Route path="/rankings" component={Rankings} />
      <Route path="/comparison" component={Comparison} />
      <Route path="/exports" component={Exports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  // Initialize WebSocket for real-time updates
  useWebSocket();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between h-14 px-6 border-b border-border flex-shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto p-6">
              <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
