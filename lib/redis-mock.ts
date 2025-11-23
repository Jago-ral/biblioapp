// lib/redis-mock.ts

/**
 * A simple in-memory cache to simulate Redis.
 * Uses a Map to store key-value pairs with expiration.
 */
class RedisMock {
  private static instance: RedisMock;
  private store: Map<string, { value: any; expiresAt: number | null }>;

  private constructor() {
    this.store = new Map();
  }

  public static getInstance(): RedisMock {
    if (!RedisMock.instance) {
      RedisMock.instance = new RedisMock();
    }
    return RedisMock.instance;
  }

  public set(key: string, value: any, ttlSeconds?: number): void {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  public get(key: string): any | null {
    const data = this.store.get(key);
    if (!data) return null;

    if (data.expiresAt && Date.now() > data.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return data.value;
  }

  public del(key: string): void {
    this.store.delete(key);
  }

  public flushAll(): void {
    this.store.clear();
  }
}

export const redis = RedisMock.getInstance();
