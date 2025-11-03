/**
 * SISTEMA DE CACHE EN MEMORIA
 * Cache simple para optimizar performance
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  totalEntries: number;
  hitRate: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalEntries: 0,
    hitRate: 0
  };

  set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, {
      data,
      expiresAt,
      createdAt: Date.now()
    });
    this.stats.totalEntries = this.cache.size;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Verificar expiración
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    this.stats.hits++;
    this.updateHitRate();
    return entry.data;
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.stats.totalEntries = this.cache.size;
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalEntries: 0,
      hitRate: 0
    };
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  // Limpiar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
    this.stats.totalEntries = this.cache.size;
  }
}

// Instancia global del cache
export const cache = new MemoryCache();

// Limpiar cache expirado cada 5 minutos
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

// Funciones de conveniencia
export const cacheUser = (userId: string, userData: any): void => {
  cache.set(`user:${userId}`, userData, 10 * 60 * 1000); // 10 minutos
};

export const getCachedUser = (userId: string): any => {
  return cache.get(`user:${userId}`);
};

export const cacheAuth = (email: string, authData: any): void => {
  cache.set(`auth:${email}`, authData, 5 * 60 * 1000); // 5 minutos
};

export const getCachedAuth = (email: string): any => {
  return cache.get(`auth:${email}`);
};
