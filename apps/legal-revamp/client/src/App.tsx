import { Router as WouterRouter, Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Speaking from "@/pages/Speaking";
import Blog from "@/pages/Blog";
import Resources from "@/pages/Resources";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function resolveBasePath() {
  if (typeof window === "undefined") return "";

  const segments = window.location.pathname.split("/").filter(Boolean);
  return segments.length > 0 ? `/${segments[0]}` : "";
}

const basePath = resolveBasePath();

function Router() {
  return (
    <div className="min-h-screen bg-light-bg">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/services" component={Services} />
        <Route path="/speaking" component={Speaking} />
        <Route path="/blog" component={Blog} />
        <Route path="/resources" component={Resources} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
      <Footer />
    </div>
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
