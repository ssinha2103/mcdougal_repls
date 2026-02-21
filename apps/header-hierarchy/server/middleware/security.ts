import { Request, Response, NextFunction } from 'express';

// In-memory store for rate limiting (in production, use Redis or similar)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 30) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  private getKey(req: Request): string {
    // Use IP address as key, with fallback to a default
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  check(req: Request): { allowed: boolean; retryAfter?: number } {
    const key = this.getKey(req);
    const now = Date.now();
    
    let entry = this.store.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry
      entry = {
        count: 1,
        resetTime: now + this.windowMs
      };
      this.store.set(key, entry);
      return { allowed: true };
    }
    
    entry.count++;
    
    if (entry.count > this.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return { allowed: false, retryAfter };
    }
    
    return { allowed: true };
  }
}

// Different rate limiters for different endpoints
// In development, use more lenient limits for testing
const isDevelopment = process.env.NODE_ENV === 'development';
const generalLimiter = new RateLimiter(60000, isDevelopment ? 1000 : 30); // Development: 1000/min, Production: 30/min
const analysisLimiter = new RateLimiter(60000, isDevelopment ? 100 : 10); // Development: 100/min, Production: 10/min
const batchLimiter = new RateLimiter(300000, isDevelopment ? 50 : 5); // Development: 50/5min, Production: 5/5min

// Rate limiting middleware factory
export function createRateLimiter(type: 'general' | 'analysis' | 'batch' = 'general') {
  return (req: Request, res: Response, next: NextFunction) => {
    let limiter: RateLimiter;
    
    switch (type) {
      case 'analysis':
        limiter = analysisLimiter;
        break;
      case 'batch':
        limiter = batchLimiter;
        break;
      default:
        limiter = generalLimiter;
    }
    
    const result = limiter.check(req);
    
    if (!result.allowed) {
      res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter
      });
      return;
    }
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', type === 'analysis' ? '10' : type === 'batch' ? '5' : '30');
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, (type === 'analysis' ? 10 : type === 'batch' ? 5 : 30) - 1)));
    res.setHeader('X-RateLimit-Reset', new Date(Date.now() + (type === 'batch' ? 300000 : 60000)).toISOString());
    
    next();
  };
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent XSS attacks
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Allow iframe embedding - removed X-Frame-Options: DENY to enable iframe support
  // The app can now be embedded in iframes on any domain
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS (HTTP Strict Transport Security)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query) as any;
  }
  
  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params) as any;
  }
  
  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    // Remove any potential script tags or dangerous HTML
    return obj
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Sanitize the key as well
        const sanitizedKey = key.replace(/[^\w\s-_.]/g, '');
        sanitized[sanitizedKey] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

// Request size limiting middleware
export function requestSizeLimit(maxSize: number = 1024 * 1024) { // Default 1MB
  return (req: Request, res: Response, next: NextFunction) => {
    let size = 0;
    
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        res.status(413).json({
          error: 'Payload too large',
          message: `Request body exceeds maximum size of ${maxSize} bytes`
        });
        req.connection.destroy();
      }
    });
    
    next();
  };
}

// CSRF token generation and validation
const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
  const expires = Date.now() + 3600000; // 1 hour
  
  csrfTokens.set(sessionId, { token, expires });
  
  // Clean up expired tokens
  for (const [key, value] of csrfTokens.entries()) {
    if (value.expires < Date.now()) {
      csrfTokens.delete(key);
    }
  }
  
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  
  if (!stored || stored.expires < Date.now()) {
    return false;
  }
  
  return stored.token === token;
}

// CSRF protection middleware
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET requests and OPTIONS
  if (req.method === 'GET' || req.method === 'OPTIONS') {
    return next();
  }
  
  // For now, we'll skip CSRF validation in development
  // In production, you'd want to properly implement session-based CSRF tokens
  if (process.env.NODE_ENV === 'production') {
    const token = req.headers['x-csrf-token'] as string;
    const sessionId = req.sessionID || req.ip || 'default';
    
    if (!token || !validateCSRFToken(sessionId, token)) {
      return res.status(403).json({
        error: 'Invalid CSRF token',
        message: 'Security validation failed. Please refresh the page and try again.'
      });
    }
  }
  
  next();
}

// Combined security middleware
export function applySecurity() {
  return [
    securityHeaders,
    sanitizeInput,
    requestSizeLimit(),
    createRateLimiter('general'),
    // CSRF protection would go here in production
  ];
}