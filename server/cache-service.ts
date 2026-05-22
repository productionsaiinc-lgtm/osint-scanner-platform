import Redis from "ioredis";

/**
 * Redis Caching Service
 * Caches expensive API calls to reduce costs and improve response times
 * 
 * Cached endpoints:
 * - Shodan searches (cost: $0.001-0.01 per query)
 * - OpenSky flight tracking (cost: free tier limited)
 * - Etherscan crypto lookups (cost: free tier limited)
 * - AWS Rekognition deepfake detection (cost: $1-2 per image)
 * - Have I Been Pwned dark web monitoring (cost: free tier limited)
 */

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  ttl: number; // Time to live in seconds
}

class CacheService {
  private redis: Redis | null = null;
  private config: CacheConfig;
  private enabled: boolean;

  constructor() {
    this.enabled = !!process.env.REDIS_URL || !!process.env.REDIS_HOST;
    
    this.config = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      ttl: parseInt(process.env.REDIS_TTL || "3600"), // 1 hour default
    };

    if (this.enabled) {
      this.connect();
    }
  }

  private connect() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
      } else {
        this.redis = new Redis({
          host: this.config.host,
          port: this.config.port,
          password: this.config.password,
          retryStrategy: (times) => Math.min(times * 50, 2000),
          enableReadyCheck: false,
          enableOfflineQueue: false,
        });
      }

      this.redis.on("connect", () => {
        console.log("[Cache] Redis connected");
      });

      this.redis.on("error", (err) => {
        console.warn("[Cache] Redis error:", err.message);
      });
    } catch (error) {
      console.warn("[Cache] Failed to initialize Redis:", error);
      this.enabled = false;
    }
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.redis) return null;

    try {
      const value = await this.redis.get(key);
      if (value) {
        console.log(`[Cache] HIT: ${key}`);
        return JSON.parse(value) as T;
      }
      console.log(`[Cache] MISS: ${key}`);
      return null;
    } catch (error) {
      console.warn(`[Cache] Get error for ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached value with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.enabled || !this.redis) return false;

    try {
      const expiry = ttl || this.config.ttl;
      await this.redis.setex(key, expiry, JSON.stringify(value));
      console.log(`[Cache] SET: ${key} (TTL: ${expiry}s)`);
      return true;
    } catch (error) {
      console.warn(`[Cache] Set error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<boolean> {
    if (!this.enabled || !this.redis) return false;

    try {
      await this.redis.del(key);
      console.log(`[Cache] DELETE: ${key}`);
      return true;
    } catch (error) {
      console.warn(`[Cache] Delete error for ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cached values
   */
  async clear(): Promise<boolean> {
    if (!this.enabled || !this.redis) return false;

    try {
      await this.redis.flushdb();
      console.log("[Cache] FLUSH: All cache cleared");
      return true;
    } catch (error) {
      console.warn("[Cache] Flush error:", error);
      return false;
    }
  }

  /**
   * Get cache stats
   */
  async getStats(): Promise<{ enabled: boolean; keys?: number; memory?: string }> {
    if (!this.enabled || !this.redis) {
      return { enabled: false };
    }

    try {
      const info = await this.redis.info("stats");
      const dbSize = await this.redis.dbsize();
      return {
        enabled: true,
        keys: dbSize,
        memory: info,
      };
    } catch (error) {
      console.warn("[Cache] Stats error:", error);
      return { enabled: false };
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      console.log("[Cache] Redis disconnected");
    }
  }

  /**
   * Check if cache is available
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const cacheService = new CacheService();

// Cache key generators
export const cacheKeys = {
  // Shodan searches
  shodan: (query: string) => `shodan:${query}`,
  
  // OpenSky flights
  flight: (callsign: string) => `flight:${callsign}`,
  
  // Etherscan crypto
  crypto: (address: string, chain: string) => `crypto:${chain}:${address}`,
  
  // AWS Rekognition deepfake
  deepfake: (imageUrl: string) => `deepfake:${Buffer.from(imageUrl).toString("base64").slice(0, 50)}`,
  
  // Have I Been Pwned
  breach: (email: string) => `breach:${email}`,
  
  // VIN decoder
  vin: (vin: string) => `vin:${vin}`,
  
  // IMEI lookup
  imei: (imei: string) => `imei:${imei}`,
  
  // IP geolocation
  ip: (ip: string) => `ip:${ip}`,
  
  // DNS enumeration
  dns: (domain: string) => `dns:${domain}`,
  
  // Web scraper
  scrape: (url: string) => `scrape:${Buffer.from(url).toString("base64").slice(0, 50)}`,
};

// Cache TTL presets (in seconds)
export const cacheTTL = {
  SHORT: 300, // 5 minutes - for frequently changing data
  MEDIUM: 3600, // 1 hour - for moderately changing data
  LONG: 86400, // 24 hours - for stable data
  VERY_LONG: 604800, // 7 days - for rarely changing data
};

/**
 * Wrapper function to cache API calls
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = cacheTTL.MEDIUM
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheService.get<T>(key);
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  await cacheService.set(key, data, ttl);

  return data;
}
