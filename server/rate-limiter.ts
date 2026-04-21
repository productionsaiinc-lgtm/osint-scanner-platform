import { Request, Response, NextFunction } from "express";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Create a rate limiter middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = "Too many requests, please try again later" } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.ip || req.socket.remoteAddress}`;
    const now = Date.now();

    // Initialize or reset the counter
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Increment the counter
    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
      return;
    }

    // Set headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - store[key].count);
    res.setHeader("X-RateLimit-Reset", store[key].resetTime);

    next();
  };
}

/**
 * Per-user rate limiter (requires authentication)
 */
export function createPerUserRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = "Too many requests, please try again later" } = config;

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    if (!userId) {
      return next();
    }

    const key = `user:${userId}`;
    const now = Date.now();

    // Initialize or reset the counter
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    // Increment the counter
    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > maxRequests) {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
      return;
    }

    // Set headers
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - store[key].count);
    res.setHeader("X-RateLimit-Reset", store[key].resetTime);

    next();
  };
}

/**
 * Quota management for different user tiers
 */
export interface UserQuota {
  tier: "free" | "pro" | "enterprise";
  dailyLimit: number;
  monthlyLimit: number;
  concurrentRequests: number;
}

const quotaByTier: Record<string, UserQuota> = {
  free: {
    tier: "free",
    dailyLimit: 100,
    monthlyLimit: 1000,
    concurrentRequests: 5,
  },
  pro: {
    tier: "pro",
    dailyLimit: 10000,
    monthlyLimit: 100000,
    concurrentRequests: 50,
  },
  enterprise: {
    tier: "enterprise",
    dailyLimit: Infinity,
    monthlyLimit: Infinity,
    concurrentRequests: 500,
  },
};

/**
 * Check user quota
 */
export function getUserQuota(tier: string): UserQuota {
  return quotaByTier[tier] || quotaByTier["free"];
}

/**
 * Update user quota usage
 */
export function updateQuotaUsage(userId: string, tier: string, usage: number) {
  const quota = getUserQuota(tier);
  const key = `quota:${userId}`;

  if (!store[key]) {
    store[key] = {
      count: usage,
      resetTime: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };
  } else {
    store[key].count += usage;
  }

  return store[key].count <= quota.dailyLimit;
}

/**
 * Get remaining quota for user
 */
export function getRemainingQuota(userId: string, tier: string): number {
  const quota = getUserQuota(tier);
  const key = `quota:${userId}`;
  const used = store[key]?.count || 0;
  return Math.max(0, quota.dailyLimit - used);
}

/**
 * Clean up old entries (call periodically)
 */
export function cleanupOldEntries() {
  const now = Date.now();
  let cleaned = 0;

  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
      cleaned++;
    }
  }

  console.log(`[Rate Limiter] Cleaned up ${cleaned} old entries`);
}

// Run cleanup every hour
setInterval(cleanupOldEntries, 60 * 60 * 1000);
