---
id: redis-examples
title: Redis Module Examples & Best Practices
sidebar_label: Examples & Best Practices
slug: /redis-examples
description: Các ví dụ thực tế và best practices khi sử dụng Redis module trong ứng dụng NestJS.
tags: [examples, best-practices, use-cases, patterns, redis-module]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::info
Tài liệu này cung cấp các ví dụ thực tế và best practices khi sử dụng Redis module. Các ví dụ được thiết kế để giải quyết các vấn đề thường gặp trong ứng dụng production.
:::

## Use Cases & Examples

### 1. User Session Management

Quản lý user sessions với Redis, bao gồm caching và TTL management.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedisFacade } from '@ecom-co/redis';
import { RedisFacade } from '@ecom-co/redis';

@Injectable()
export class SessionService {
    constructor(@InjectRedisFacade('session') private readonly session: RedisFacade) {}

    async createSession(userId: string, sessionData: any) {
        const sessionId = this.generateSessionId();
        const key = `session:${sessionId}`;

        await this.session.setJson(
            key,
            {
                userId,
                data: sessionData,
                createdAt: Date.now(),
            },
            { ttlSeconds: 86400 },
        ); // 24 giờ

        return sessionId;
    }

    async getSession(sessionId: string) {
        const key = `session:${sessionId}`;
        return await this.session.getJson(key);
    }

    async updateSession(sessionId: string, updates: any) {
        const key = `session:${sessionId}`;
        const current = await this.getSession(sessionId);

        if (!current) return null;

        const updated = { ...current, ...updates, updatedAt: Date.now() };
        await this.session.setJson(key, updated, { ttlSeconds: 86400 });

        return updated;
    }

    async deleteSession(sessionId: string) {
        const key = `session:${sessionId}`;
        return await this.session.del(key);
    }

    async extendSession(sessionId: string, additionalSeconds: number) {
        const key = `session:${sessionId}`;
        const current = await this.getSession(sessionId);

        if (!current) return false;

        const currentTtl = await this.session.ttl(key);
        const newTtl = currentTtl + additionalSeconds;

        return await this.session.expire(key, newTtl);
    }

    private generateSessionId(): string {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
```

### 2. Product Catalog Caching

Cache product catalog với cache-aside pattern và background refresh.

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedisFacade } from '@ecom-co/redis';
import { RedisFacade } from '@ecom-co/redis';

@Injectable()
export class ProductService {
    constructor(
        @InjectRedisFacade('catalog') private readonly cache: RedisFacade,
        private readonly productRepository: ProductRepository,
    ) {}

    async getProduct(id: string) {
        return await this.cache.cacheAside(
            `product:${id}`,
            async () => {
                return await this.productRepository.findById(id);
            },
            {
                ttlSeconds: 3600, // 1 giờ
                refreshThreshold: 0.8, // Refresh khi 80% TTL đã qua
            },
        );
    }

    async getProductsByCategory(categoryId: string, page: number, limit: number) {
        const key = `products:category:${categoryId}:page:${page}:limit:${limit}`;

        return await this.cache.getOrSet(key, 1800, async () => {
            return await this.productRepository.findByCategory(categoryId, page, limit);
        });
    }

    async searchProducts(query: string, filters: any) {
        const cacheKey = `search:${this.hashQuery(query, filters)}`;

        return await this.cache.getOrSet(cacheKey, 900, async () => {
            return await this.productRepository.search(query, filters);
        });
    }

    async invalidateProductCache(productId: string) {
        // Xóa product cache
        await this.cache.del(`product:${productId}`);

        // Xóa category caches
        const categoryKeys = await this.cache.keys('products:category:*');
        await this.cache.del(...categoryKeys);

        // Xóa search caches
        const searchKeys = await this.cache.keys('search:*');
        await this.cache.del(...searchKeys);
    }

    private hashQuery(query: string, filters: any): string {
        return Buffer.from(JSON.stringify({ query, filters })).toString('base64');
    }
}
```

### 3. Rate Limiting Implementation

Implement rate limiting cho API endpoints với multiple strategies.

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRedisFacade } from '@ecom-co/redis';
import { RedisFacade } from '@ecom-co/redis';

@Injectable()
export class RateLimitService {
    constructor(@InjectRedisFacade('rate-limit') private readonly cache: RedisFacade) {}

    async checkUserRateLimit(userId: string, endpoint: string) {
        const key = `rate:user:${userId}:${endpoint}`;
        const limit = this.getEndpointLimit(endpoint);

        const result = await this.cache.rateLimit(key, limit.requests, limit.window);

        if (!result.allowed) {
            throw new HttpException(
                {
                    message: 'Rate limit exceeded',
                    retryAfter: result.retryAfter,
                    resetTime: result.resetTime,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return result;
    }

    async checkIPRateLimit(ip: string, endpoint: string) {
        const key = `rate:ip:${ip}:${endpoint}`;
        const limit = this.getEndpointLimit(endpoint);

        const result = await this.cache.slidingWindowRateLimit(key, limit.requests, limit.window);

        if (!result.allowed) {
            throw new HttpException(
                {
                    message: 'IP rate limit exceeded',
                    retryAfter: result.retryAfter,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return result;
    }

    async checkMultipleLimits(userId: string, ip: string, endpoint: string) {
        const limits = [
            { key: `user:${userId}:${endpoint}`, limit: 100, windowMs: 60000 },
            { key: `ip:${ip}:${endpoint}`, limit: 1000, windowMs: 60000 },
        ];

        const results = await this.cache.rateLimitMultiple(limits);

        // Kiểm tra tất cả limits
        const exceeded = results.find((r) => !r.allowed);
        if (exceeded) {
            throw new HttpException(
                {
                    message: 'Rate limit exceeded',
                    retryAfter: exceeded.retryAfter,
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return results;
    }

    private getEndpointLimit(endpoint: string) {
        const limits = {
            'auth:login': { requests: 5, window: 300000 }, // 5 requests / 5 phút
            'auth:register': { requests: 3, window: 3600000 }, // 3 requests / 1 giờ
            'api:products': { requests: 100, window: 60000 }, // 100 requests / 1 phút
            'api:orders': { requests: 50, window: 60000 }, // 50 requests / 1 phút
        };

        return limits[endpoint] || { requests: 100, window: 60000 };
    }
}
```

### 4. Distributed Lock for Order Processing

Sử dụng distributed lock để đảm bảo order processing không bị duplicate.

```typescript
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRedisFacade } from '@ecom-co/redis';
import { RedisFacade } from '@ecom-co/redis';

@Injectable()
export class OrderService {
    constructor(
        @InjectRedisFacade('orders') private readonly cache: RedisFacade,
        private readonly orderRepository: OrderRepository,
        private readonly inventoryService: InventoryService,
    ) {}

    async processOrder(orderId: string, orderData: any) {
        return await this.cache.withLock(
            `order:processing:${orderId}`,
            30000, // 30 giây
            async () => {
                // Kiểm tra order đã tồn tại
                const existing = await this.orderRepository.findById(orderId);
                if (existing) {
                    throw new ConflictException('Order already exists');
                }

                // Kiểm tra inventory
                const inventoryCheck = await this.inventoryService.checkAvailability(orderData.items);

                if (!inventoryCheck.available) {
                    throw new ConflictException('Insufficient inventory');
                }

                // Tạo order
                const order = await this.orderRepository.create(orderData);

                // Cập nhật inventory
                await this.inventoryService.reserveItems(orderData.items);

                // Cache order
                await this.cache.setJson(`order:${orderId}`, order, {
                    ttlSeconds: 86400,
                });

                return order;
            },
            { maxRetries: 3, retryDelayMs: 100 },
        );
    }

    async cancelOrder(orderId: string, reason: string) {
        return await this.cache.withLock(
            `order:cancellation:${orderId}`,
            15000, // 15 giây
            async () => {
                const order = await this.orderRepository.findById(orderId);

                if (!order) {
                    throw new ConflictException('Order not found');
                }

                if (order.status === 'CANCELLED') {
                    throw new ConflictException('Order already cancelled');
                }

                // Cancel order
                const cancelledOrder = await this.orderRepository.cancel(orderId, reason);

                // Release inventory
                await this.inventoryService.releaseItems(order.items);

                // Update cache
                await this.cache.setJson(`order:${orderId}`, cancelledOrder, {
                    ttlSeconds: 86400,
                });

                return cancelledOrder;
            },
        );
    }
}
```

### 5. Real-time Notifications with Pub/Sub

Implement real-time notifications sử dụng Redis pub/sub.

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRedisFacade } from '@ecom-co/redis';
import { RedisFacade } from '@ecom-co/redis';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@Injectable()
@WebSocketGateway()
export class NotificationService implements OnModuleInit {
    @WebSocketServer()
    private server: Server;

    private subscriber: RedisFacade;

    constructor(
        @InjectRedisFacade('notifications') private readonly publisher: RedisFacade,
        @InjectRedisFacade('notifications') private readonly cache: RedisFacade,
    ) {}

    async onModuleInit() {
        // Tạo subscriber connection
        this.subscriber = new RedisFacade(
            this.cache['client'], // Access underlying client
            'notifications:',
        );

        // Subscribe to channels
        await this.subscribeToChannels();
    }

    async sendNotification(userId: string, notification: any) {
        const channel = `user:${userId}:notifications`;

        // Publish notification
        await this.publisher.publishJson(channel, {
            ...notification,
            timestamp: Date.now(),
        });

        // Store in cache for offline users
        await this.cache.lpush(`notifications:${userId}`, notification);

        // Limit stored notifications
        await this.cache.ltrim(`notifications:${userId}`, 0, 99);
    }

    async sendBroadcastNotification(notification: any, userFilter?: string[]) {
        const channel = 'broadcast:notifications';

        if (userFilter) {
            // Send to specific users
            for (const userId of userFilter) {
                await this.sendNotification(userId, notification);
            }
        } else {
            // Send to all users
            await this.publisher.publishJson(channel, {
                ...notification,
                timestamp: Date.now(),
            });
        }
    }

    async getOfflineNotifications(userId: string) {
        const key = `notifications:${userId}`;
        const notifications = await this.cache.lrange(key, 0, -1);

        // Clear after reading
        await this.cache.del(key);

        return notifications;
    }

    private async subscribeToChannels() {
        // Subscribe to user notifications
        const userPattern = 'user:*:notifications';
        const userKeys = await this.cache.scanKeys(userPattern);

        for (const key of userKeys) {
            const userId = key.split(':')[1];
            await this.subscribeToUserChannel(userId);
        }

        // Subscribe to broadcast channel
        await this.subscribeToBroadcastChannel();
    }

    private async subscribeToUserChannel(userId: string) {
        const channel = `user:${userId}:notifications`;

        // This is a simplified example - in real implementation you'd use Redis SUBSCRIBE
        // For now, we'll use polling approach
        setInterval(async () => {
            const notification = await this.cache.rpop(channel);
            if (notification) {
                this.server.to(`user:${userId}`).emit('notification', notification);
            }
        }, 1000);
    }

    private async subscribeToBroadcastChannel() {
        const channel = 'broadcast:notifications';

        // Polling approach for broadcast notifications
        setInterval(async () => {
            const notification = await this.cache.rpop(channel);
            if (notification) {
                this.server.emit('broadcast', notification);
            }
        }, 1000);
    }
}
```

### 6. Cache Warming & Background Jobs

Implement cache warming và background jobs để tối ưu performance.

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRedisFacade } from '@ecom-co/redis';
import { RedisFacade } from '@ecom-co/redis';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CacheWarmingService implements OnModuleInit {
    constructor(
        @InjectRedisFacade('cache') private readonly cache: RedisFacade,
        private readonly productService: ProductService,
        private readonly categoryService: CategoryService,
    ) {}

    async onModuleInit() {
        // Warm cache on startup
        await this.warmCache();
    }

    @Cron(CronExpression.EVERY_HOUR)
    async warmCache() {
        console.log('Starting cache warming...');

        try {
            // Warm popular products
            await this.warmPopularProducts();

            // Warm categories
            await this.warmCategories();

            // Warm search suggestions
            await this.warmSearchSuggestions();

            console.log('Cache warming completed');
        } catch (error) {
            console.error('Cache warming failed:', error);
        }
    }

    private async warmPopularProducts() {
        const popularProducts = await this.productService.getPopularProducts();

        for (const product of popularProducts) {
            await this.cache.setJson(`product:${product.id}`, product, { ttlSeconds: 3600 });
        }
    }

    private async warmCategories() {
        const categories = await this.categoryService.getAllCategories();

        for (const category of categories) {
            await this.cache.setJson(`category:${category.id}`, category, { ttlSeconds: 7200 });

            // Warm first page of products for each category
            const products = await this.productService.getProductsByCategory(category.id, 1, 20);

            await this.cache.setJson(`products:category:${category.id}:page:1:limit:20`, products, {
                ttlSeconds: 1800,
            });
        }
    }

    private async warmSearchSuggestions() {
        const suggestions = await this.productService.getSearchSuggestions();

        await this.cache.setJson('search:suggestions', suggestions, { ttlSeconds: 3600 });
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async cleanupExpiredCache() {
        console.log('Starting cache cleanup...');

        try {
            // Find expired keys
            const expiredKeys = await this.cache.scanKeys('*');
            const toDelete: string[] = [];

            for (const key of expiredKeys) {
                const ttl = await this.cache.ttl(key);
                if (ttl === -2) {
                    // Key doesn't exist
                    toDelete.push(key);
                }
            }

            if (toDelete.length > 0) {
                // Delete in batches
                const batches = this.chunkArray(toDelete, 1000);

                for (const batch of batches) {
                    await this.cache.del(...batch);
                }

                console.log(`Cleaned up ${toDelete.length} expired keys`);
            }
        } catch (error) {
            console.error('Cache cleanup failed:', error);
        }
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];

        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }

        return chunks;
    }
}
```

## Best Practices

### 1. Key Naming Convention

```typescript
// ✅ Tốt - Sử dụng colon separator và descriptive names
const keys = {
    user: `user:${userId}:profile`,
    session: `session:${sessionId}`,
    product: `product:${productId}:details`,
    category: `category:${categoryId}:products:page:${page}:limit:${limit}`,
    search: `search:${hashQuery(query, filters)}`,
    rateLimit: `rate:user:${userId}:${endpoint}`,
    lock: `lock:order:${orderId}:processing`,
};

// ❌ Không tốt - Không có structure
const badKeys = {
    user: `u_${userId}`,
    session: `s_${sessionId}`,
    product: `p_${productId}`,
};
```

### 2. Error Handling Strategy

```typescript
@Injectable()
export class RobustCacheService {
    constructor(
        @InjectRedisFacade() private readonly cache: RedisFacade,
        private readonly logger: Logger,
    ) {}

    async getWithFallback<T>(key: string, fallback: () => Promise<T>): Promise<T> {
        try {
            const cached = await this.cache.get<T>(key);
            if (cached !== null) {
                return cached;
            }
        } catch (error) {
            this.logger.warn(`Cache get failed for key ${key}:`, error);
        }

        try {
            const fresh = await fallback();

            // Try to cache, but don't fail if it doesn't work
            try {
                await this.cache.set(key, fresh, { ttlSeconds: 3600 });
            } catch (cacheError) {
                this.logger.warn(`Cache set failed for key ${key}:`, cacheError);
            }

            return fresh;
        } catch (fallbackError) {
            this.logger.error(`Fallback failed for key ${key}:`, fallbackError);
            throw fallbackError;
        }
    }
}
```

### 3. Circuit Breaker Configuration

```typescript
const productionConfig = {
    circuitBreakerThreshold: 10, // Higher threshold for production
    circuitBreakerTimeout: 120000, // 2 minutes timeout
    maxRetries: 5, // More retries
    retryDelay: 200, // Longer delay
    bulkOperationChunkSize: 500, // Smaller chunks for stability
    statsFlushInterval: 10000, // More frequent stats
};

const developmentConfig = {
    circuitBreakerThreshold: 3, // Lower threshold for development
    circuitBreakerTimeout: 30000, // 30 seconds timeout
    maxRetries: 2, // Fewer retries
    retryDelay: 100, // Shorter delay
    bulkOperationChunkSize: 1000, // Larger chunks for speed
    statsFlushInterval: 5000, // Less frequent stats
};
```

### 4. Monitoring & Alerting

```typescript
@Injectable()
export class CacheMonitoringService {
    constructor(
        @InjectRedisFacade() private readonly cache: RedisFacade,
        private readonly alertService: AlertService,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async monitorCacheHealth() {
        try {
            const health = await this.cache.healthCheck();

            if (health.status === 'unhealthy') {
                await this.alertService.sendAlert({
                    level: 'ERROR',
                    message: `Redis cache is unhealthy: ${health.error}`,
                    context: { latency: health.latency },
                });
            }

            if (health.latency > 100) {
                // > 100ms
                await this.alertService.sendAlert({
                    level: 'WARNING',
                    message: `Redis cache latency is high: ${health.latency}ms`,
                    context: { latency: health.latency },
                });
            }
        } catch (error) {
            await this.alertService.sendAlert({
                level: 'ERROR',
                message: 'Cache monitoring failed',
                context: { error: error.message },
            });
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async monitorCacheStats() {
        try {
            const stats = await this.cache.getCacheStats();

            // Alert if hit rate is too low
            if (stats.hitRate < 80) {
                await this.alertService.sendAlert({
                    level: 'WARNING',
                    message: `Cache hit rate is low: ${stats.hitRate}%`,
                    context: { hitRate: stats.hitRate, totalRequests: stats.totalRequests },
                });
            }

            // Alert if memory usage is high
            if (stats.memoryUsage.includes('GB') && parseFloat(stats.memoryUsage) > 1) {
                await this.alertService.sendAlert({
                    level: 'WARNING',
                    message: `Cache memory usage is high: ${stats.memoryUsage}`,
                    context: { memoryUsage: stats.memoryUsage },
                });
            }
        } catch (error) {
            this.logger.error('Cache stats monitoring failed:', error);
        }
    }
}
```

### 5. Performance Optimization

```typescript
@Injectable()
export class OptimizedCacheService {
    constructor(@InjectRedisFacade() private readonly cache: RedisFacade) {}

    async getMultipleProducts(productIds: string[]) {
        // Sử dụng mget thay vì multiple get calls
        const keys = productIds.map((id) => `product:${id}`);
        const products = await this.cache.mget(keys);

        // Filter out null values and map back to original structure
        return products
            .map((product, index) => (product ? { id: productIds[index], ...product } : null))
            .filter(Boolean);
    }

    async setMultipleProducts(products: Array<{ id: string; data: any }>) {
        // Sử dụng mset với options
        const operations = products.map(({ id, data }) => ({
            key: `product:${id}`,
            value: data,
            options: { ttlSeconds: 3600 },
        }));

        await this.cache.mset(operations);
    }

    async invalidateRelatedCache(productId: string) {
        // Sử dụng pipeline để invalidate multiple keys
        const pipeline = this.cache.pipeline();

        // Find related keys
        const relatedKeys = await this.cache.scanKeys(`*${productId}*`);

        // Add delete operations to pipeline
        relatedKeys.forEach((key) => pipeline.del(key));

        // Execute all deletions at once
        await pipeline.exec();
    }
}
```

## Common Patterns

### 1. Cache-Aside with Background Refresh

```typescript
async getDataWithBackgroundRefresh<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const cached = await this.cache.get<T>(key);

  if (cached) {
    // Background refresh if near expiry
    this.backgroundRefresh(key, loader).catch(console.error);
    return cached;
  }

  const fresh = await loader();
  await this.cache.set(key, fresh, { ttlSeconds: 3600 });

  return fresh;
}

private async backgroundRefresh<T>(key: string, loader: () => Promise<T>) {
  try {
    const fresh = await loader();
    await this.cache.set(key, fresh, { ttlSeconds: 3600 });
  } catch (error) {
    // Log error but don't fail the main operation
    console.error('Background refresh failed:', error);
  }
}
```

### 2. Write-Through with Fallback

```typescript
async writeThroughWithFallback<T>(
  key: string,
  value: T,
  writer: (value: T) => Promise<void>,
  options?: RedisSetOptions
): Promise<void> {
  try {
    // Try to write to both cache and database
    await Promise.all([
      this.cache.setJson(key, value, options),
      writer(value)
    ]);
  } catch (error) {
    // If database write fails, still cache the data
    try {
      await this.cache.setJson(key, value, options);
    } catch (cacheError) {
      console.error('Cache write failed:', cacheError);
    }

    // Re-throw the original error
    throw error;
  }
}
```

### 3. Distributed Lock with Auto-Release

```typescript
async withAutoReleaseLock<T>(
  key: string,
  ttlMs: number,
  operation: () => Promise<T>
): Promise<T> {
  const lock = await this.cache.acquireLock(key, ttlMs);

  if (!lock.ok) {
    throw new Error(`Failed to acquire lock for key: ${key}`);
  }

  // Auto-release lock after TTL
  const autoRelease = setTimeout(async () => {
    try {
      await lock.release?.();
    } catch (error) {
      console.error('Auto-release lock failed:', error);
    }
  }, ttlMs);

  try {
    const result = await operation();

    // Clear auto-release and manually release
    clearTimeout(autoRelease);
    await lock.release?.();

    return result;
  } catch (error) {
    // Clear auto-release and manually release on error
    clearTimeout(autoRelease);
    await lock.release?.();
    throw error;
  }
}
```

:::tip
**Performance Tip**: Luôn sử dụng batch operations và pipeline khi có thể để giảm network round trips.
:::

:::warning
**Security Warning**: Không bao giờ cache sensitive data như passwords, tokens, hoặc PII mà không có encryption.
:::

:::info
**Monitoring Tip**: Implement comprehensive monitoring cho Redis operations để detect performance issues sớm.
:::
