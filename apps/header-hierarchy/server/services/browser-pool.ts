import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";

// Configure puppeteer-extra with stealth plugin
puppeteer.use(StealthPlugin());

interface BrowserInstance {
  browser: Browser;
  inUse: boolean;
  pageCount: number;
  lastUsed: number;
}

class BrowserPool {
  private instances: BrowserInstance[] = [];
  private maxBrowsers: number = 3;
  private maxPagesPerBrowser: number = 5;
  private browserIdleTimeout: number = 5 * 60 * 1000; // 5 minutes
  private isShuttingDown: boolean = false;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startCleanupTask();
    this.setupShutdownHandlers();
  }

  private setupShutdownHandlers() {
    const shutdown = async () => {
      if (this.isShuttingDown) return;
      this.isShuttingDown = true;
      console.log('[BrowserPool] Shutting down...');
      await this.closeAll();
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }

  private startCleanupTask() {
    this.cleanupInterval = setInterval(async () => {
      const now = Date.now();
      const toClose: BrowserInstance[] = [];

      for (const instance of this.instances) {
        if (!instance.inUse && now - instance.lastUsed > this.browserIdleTimeout) {
          toClose.push(instance);
        }
      }

      for (const instance of toClose) {
        try {
          await instance.browser.close();
          const index = this.instances.indexOf(instance);
          if (index > -1) {
            this.instances.splice(index, 1);
          }
          console.log('[BrowserPool] Closed idle browser');
        } catch (error) {
          console.error('[BrowserPool] Error closing idle browser:', error);
        }
      }
    }, 60000); // Check every minute
  }

  async getBrowser(): Promise<Browser> {
    // Try to find an available browser
    for (const instance of this.instances) {
      if (!instance.inUse && instance.pageCount < this.maxPagesPerBrowser) {
        instance.inUse = true;
        instance.lastUsed = Date.now();
        return instance.browser;
      }
    }

    // Create new browser if under limit
    if (this.instances.length < this.maxBrowsers) {
      try {
        // Auto-detect Chromium path with environment variable support
        // Randomize viewport for more realistic behavior
        const viewports = [
          { width: 1920, height: 1080 },
          { width: 1366, height: 768 },
          { width: 1440, height: 900 },
          { width: 1536, height: 864 },
          { width: 1680, height: 1050 },
          { width: 1280, height: 720 }
        ];
        const viewport = viewports[Math.floor(Math.random() * viewports.length)];
        
        const launchOptions: any = {
          headless: "new", // Use new headless mode (more similar to real Chrome)
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            `--window-size=${viewport.width},${viewport.height}`,
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-features=VizDisplayCompositor',
            '--disable-features=site-per-process',
            '--disable-site-isolation-trials',
            '--disable-features=AudioServiceOutOfProcess',
            '--disable-features=IsolateOrigins',
            '--disable-features=site-per-process',
            '--enable-features=NetworkService',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-features=ChromeWhatsNewUI',
            '--disable-features=ImprovedCookieControls,LazyFrameLoading,GlobalMediaControls,DestroyProfileOnBrowserClose',
            '--enable-automation=false',
            '--disable-blink-features',
            '--disable-blink-features=AutomationControlled'
          ],
          ignoreHTTPSErrors: true,
          defaultViewport: viewport
        };

        // Check environment variable first
        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
          launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        } else if (process.env.CHROME_PATH) {
          launchOptions.executablePath = process.env.CHROME_PATH;
        } else {
          // Try to find system Chromium
          const possiblePaths = [
            '/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium',
            '/usr/bin/chromium',
            '/usr/bin/chromium-browser',
            '/usr/bin/google-chrome',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
          ];

          for (const path of possiblePaths) {
            try {
              const fs = await import('fs');
              if (fs.existsSync(path)) {
                launchOptions.executablePath = path;
                break;
              }
            } catch {}
          }
        }

        const browser = await puppeteer.launch(launchOptions);

        const instance: BrowserInstance = {
          browser,
          inUse: true,
          pageCount: 0,
          lastUsed: Date.now()
        };

        this.instances.push(instance);
        console.log('[BrowserPool] Created new browser instance');
        return browser;
      } catch (error) {
        console.error('[BrowserPool] Failed to launch browser:', error);
        throw error;
      }
    }

    // Wait for an available browser
    console.log('[BrowserPool] Waiting for available browser...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return this.getBrowser();
  }

  async releaseBrowser(browser: Browser) {
    const instance = this.instances.find(i => i.browser === browser);
    if (instance) {
      instance.inUse = false;
      instance.lastUsed = Date.now();
    }
  }

  async createPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();
    const instance = this.instances.find(i => i.browser === browser);
    if (instance) {
      instance.pageCount++;
    }
    return page;
  }

  async closePage(page: Page) {
    const browser = page.browser();
    const instance = this.instances.find(i => i.browser === browser);
    if (instance) {
      instance.pageCount--;
    }
    await page.close();
  }

  async closeAll() {
    for (const instance of this.instances) {
      try {
        await instance.browser.close();
      } catch (error) {
        console.error('[BrowserPool] Error closing browser:', error);
      }
    }
    this.instances = [];
  }

  async healthCheck(): Promise<boolean> {
    try {
      const browser = await this.getBrowser();
      const page = await this.createPage(browser);
      await page.goto('data:text/html,<h1>Test</h1>', { timeout: 5000 });
      await this.closePage(page);
      await this.releaseBrowser(browser);
      return true;
    } catch (error) {
      console.error('[BrowserPool] Health check failed:', error);
      return false;
    }
  }
}

export const browserPool = new BrowserPool();
