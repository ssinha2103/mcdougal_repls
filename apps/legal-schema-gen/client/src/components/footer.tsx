import { Scale } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Scale className="h-5 w-5 text-primary" />
              </div>
              <span className="font-semibold">LegalService Schema Generator</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Free tool for law firms to generate perfectly formatted JSON-LD schema markup for improved local SEO.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://schema.org/LegalService"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Schema.org Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://developers.google.com/search/docs/appearance/structured-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Google Structured Data Guide
                </a>
              </li>
              <li>
                <a
                  href="https://search.google.com/test/rich-results"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Rich Results Test
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal SEO Tips</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Stay updated with the latest SEO strategies for law firms.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 text-sm rounded-lg border bg-background"
                data-testid="input-newsletter-email"
              />
              <button
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover-elevate active-elevate-2"
                data-testid="button-newsletter-subscribe"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} LegalService Schema Generator. Built for law firms by SEO professionals.</p>
        </div>
      </div>
    </footer>
  );
}
