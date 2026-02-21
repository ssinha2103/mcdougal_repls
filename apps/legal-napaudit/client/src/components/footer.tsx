import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-card/50 mt-auto">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>Powered by Google Places API</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover-elevate px-2 py-1 rounded-md" data-testid="link-privacy">Privacy Policy</a>
            <a href="#" className="hover-elevate px-2 py-1 rounded-md" data-testid="link-terms">Terms of Service</a>
            <a href="#" className="hover-elevate px-2 py-1 rounded-md" data-testid="link-contact">Contact</a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2025 Legal NAP Checker
          </div>
        </div>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          Trusted by law firms to maintain consistent directory listings
        </div>
      </div>
    </footer>
  );
}
