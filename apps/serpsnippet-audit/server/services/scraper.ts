import * as cheerio from 'cheerio';
import { UrlAnalysis } from '@shared/schema';

interface ScrapingResult {
  title?: string;
  metaDescription?: string;
  error?: string;
}

export class ScrapingService {
  private static readonly USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];

  private static getRandomUserAgent(): string {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
  }

  static async scrapeUrl(url: string): Promise<ScrapingResult> {
    const maxRetries = 2;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'close', // Use close instead of keep-alive for better compatibility
          },
          signal: AbortSignal.timeout(15000), // Increased timeout to 15 seconds
        });

        if (!response.ok) {
          const statusError = `Website returned ${response.status} ${response.statusText}`;
          console.log(`HTTP error for ${url}: ${statusError}`);
          return { error: statusError };
        }

        const html = await response.text();
        
        if (!html || html.trim().length === 0) {
          return { error: 'Website returned empty content' };
        }

        const $ = cheerio.load(html);

        // Extract title
        const title = $('title').first().text().trim();

        // Extract meta description
        const metaDescription = $('meta[name="description"]').attr('content')?.trim() || 
                               $('meta[property="og:description"]').attr('content')?.trim();

        console.log(`Successfully scraped ${url}: title="${title}", description="${metaDescription}"`);
        
        return {
          title: title || undefined,
          metaDescription: metaDescription || undefined
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.log(`Scraping attempt ${attempt}/${maxRetries} failed for ${url}:`, lastError.message);
        
        // Don't retry on certain types of errors
        if (this.shouldNotRetry(lastError)) {
          break;
        }
        
        // Wait before retry (except on last attempt)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Return user-friendly error message
    const friendlyError = this.getFriendlyErrorMessage(lastError!, url);
    console.error(`Final scraping error for ${url}:`, friendlyError);
    return { error: friendlyError };
  }

  private static shouldNotRetry(error: Error): boolean {
    const message = error.message.toLowerCase();
    // Don't retry on validation errors, DNS errors, or permanent failures
    return message.includes('invalid url') || 
           message.includes('getaddrinfo') ||
           message.includes('dns') ||
           message.includes('certificate') ||
           message.includes('ssl');
  }

  private static getFriendlyErrorMessage(error: Error, url: string): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('aborted')) {
      return 'Website took too long to respond (timeout)';
    }
    
    if (message.includes('getaddrinfo') || message.includes('dns')) {
      return 'Website could not be found (DNS error)';
    }
    
    if (message.includes('certificate') || message.includes('ssl') || message.includes('tls')) {
      return 'Website has SSL/certificate issues';
    }
    
    if (message.includes('socket') || message.includes('connection')) {
      return 'Unable to connect to website (connection error)';
    }
    
    if (message.includes('fetch failed')) {
      return 'Unable to access website (network error)';
    }
    
    if (message.includes('http')) {
      return error.message; // Already formatted HTTP errors
    }
    
    // Generic fallback
    return 'Unable to analyze this website';
  }

  static analyzeContent(title?: string, metaDescription?: string, url?: string): UrlAnalysis {
    const analysis: Partial<UrlAnalysis> = {
      url: url || '',
      title,
      metaDescription,
      titleLength: title?.length || 0,
      descriptionLength: metaDescription?.length || 0,
      issues: [],
      recommendations: [],
      scrapedAt: new Date()
    };

    // Analyze title tag
    if (!title) {
      analysis.issues!.push({
        type: 'error',
        title: 'Missing title tag',
        description: 'Page does not have a title tag'
      });
    } else {
      analysis.issues!.push({
        type: 'success',
        title: 'Title tag found',
        description: 'Page has a valid title tag'
      });

      if (title.length < 30) {
        analysis.issues!.push({
          type: 'warning',
          title: 'Title too short',
          description: 'Title is shorter than recommended 30-60 characters'
        });
      } else if (title.length > 60) {
        analysis.issues!.push({
          type: 'warning',
          title: 'Title too long',
          description: 'Title may be truncated in search results'
        });
      }
    }

    // Analyze meta description
    if (!metaDescription) {
      analysis.issues!.push({
        type: 'error',
        title: 'Missing meta description',
        description: 'Page does not have a meta description'
      });
    } else {
      analysis.issues!.push({
        type: 'success',
        title: 'Meta description found',
        description: 'Page has a valid meta description'
      });

      if (metaDescription.length < 120) {
        analysis.issues!.push({
          type: 'info',
          title: 'Description could be longer',
          description: 'Consider expanding description to 120-160 characters'
        });
      } else if (metaDescription.length > 160) {
        analysis.issues!.push({
          type: 'warning',
          title: 'Description too long',
          description: 'Description may be truncated in search results'
        });
      }
    }

    // Add recommendations
    if (title && metaDescription) {
      analysis.recommendations!.push({
        title: 'Include target keywords',
        description: 'Ensure your primary keyword appears in both title and description'
      });

      analysis.recommendations!.push({
        title: 'Add compelling call-to-action',
        description: 'Use action words to encourage clicks from search results'
      });

      analysis.recommendations!.push({
        title: 'Optimize for featured snippets',
        description: 'Structure your meta description to answer common questions directly'
      });
    }

    return analysis as UrlAnalysis;
  }
}
