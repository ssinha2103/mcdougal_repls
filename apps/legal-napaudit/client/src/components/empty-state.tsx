import { Search, CheckCircle2, AlertCircle, Database, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function EmptyState() {
  return (
    <div className="mt-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2">How It Works</h2>
        <p className="text-muted-foreground">Simple, fast, and accurate NAP consistency checking</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <Card className="p-6 hover-elevate">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">1. Search Your Firm</h3>
            <p className="text-sm text-muted-foreground">
              Enter your law firm name and location. We'll fetch your canonical NAP data from Google Places.
            </p>
          </div>
        </Card>
        
        <Card className="p-6 hover-elevate">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Database className="h-6 w-6 text-chart-2" />
            </div>
            <h3 className="font-semibold text-lg">2. Check Directories</h3>
            <p className="text-sm text-muted-foreground">
              We automatically scan major legal directories like Avvo, FindLaw, Justia, Yelp, and more.
            </p>
          </div>
        </Card>
        
        <Card className="p-6 hover-elevate">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-chart-3" />
            </div>
            <h3 className="font-semibold text-lg">3. Get Your Report</h3>
            <p className="text-sm text-muted-foreground">
              View detailed inconsistencies and export a comprehensive report for your records.
            </p>
          </div>
        </Card>
      </div>
      
      <div className="mt-12 max-w-3xl mx-auto space-y-6">
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex gap-4">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-2">Why NAP Consistency Matters</h3>
              <p className="text-sm text-muted-foreground">
                Inconsistent Name, Address, and Phone information across directories is one of the most 
                significant negative ranking factors in local SEO. Google uses citation consistency to 
                verify the legitimacy of your business and determine local search rankings.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-4 items-start">
              <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center flex-shrink-0">
                <Layers className="h-6 w-6 text-chart-3" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Need to Check Multiple Locations?</h3>
                <p className="text-sm text-muted-foreground">
                  Use our batch checking feature to verify NAP consistency for multiple law firm locations at once.
                </p>
              </div>
            </div>
            <Button asChild data-testid="button-batch-check">
              <Link href="/batch">
                <Layers className="h-4 w-4 mr-2" />
                Batch Check
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
