// Concurrency manager for controlling parallel analysis requests
class ConcurrencyManager {
  private queue: Array<() => Promise<any>> = [];
  private running: number = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent: number = 5) {
    this.maxConcurrent = maxConcurrent;
  }

  async run<T>(task: () => Promise<T>): Promise<T> {
    // If we're at max concurrency, queue the task
    if (this.running >= this.maxConcurrent) {
      await new Promise<void>((resolve) => {
        this.queue.push(async () => {
          resolve();
          return Promise.resolve();
        });
      });
    }

    this.running++;

    try {
      const result = await task();
      return result;
    } finally {
      this.running--;
      this.processQueue();
    }
  }

  private processQueue() {
    if (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }

  getStatus() {
    return {
      running: this.running,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent
    };
  }

  setMaxConcurrent(max: number) {
    this.maxConcurrent = Math.max(1, Math.min(max, 10)); // Clamp between 1-10
    this.processQueue();
  }
}

export const concurrencyManager = new ConcurrencyManager(5);
