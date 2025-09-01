---
id: redis-api-reference
title: Redis Module API Reference
sidebar_label: API Reference
slug: /redis-api-reference
description: Tham khảo đầy đủ các API, decorators, interfaces và types của Redis module.
tags: [api-reference, decorators, interfaces, types, redis-module]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::info
Tài liệu này cung cấp tham khảo đầy đủ về các API, decorators, interfaces và types của Redis module. Sử dụng để hiểu rõ cách sử dụng từng thành phần.
:::

## Decorators

### @InjectRedis

Inject Redis client instance vào service hoặc controller.

```typescript
import { InjectRedis } from '@ecom-co/redis';
import type { Redis } from 'ioredis';

@Injectable()
export class CacheService {
    constructor(
        @InjectRedis() private readonly redis: Redis, // Default client
        @InjectRedis('cache') private readonly cache: Redis, // Named client
        @InjectRedis('session') private readonly session: Redis, // Another named client
    ) {}
}
```

**Parameters:**

- `name?: string` - Tên Redis client (case-insensitive, mặc định: 'default')

**Returns:** `ParameterDecorator`

**Example:**

```typescript
// Inject default Redis client
@InjectRedis()
private readonly redis: Redis;

// Inject named Redis client
@InjectRedis('cache')
private readonly cacheRedis: Redis;
```

### @InjectRedisFacade

Inject RedisFacade instance vào service hoặc controller.

```typescript
import { InjectRedisFacade } from '@ecom-co/redis';
import { RedisFacade } from '@ecom-co/redis';

@Injectable()
export class UserService {
    constructor(
        @InjectRedisFacade() private readonly cache: RedisFacade, // Default facade
        @InjectRedisFacade('cache') private readonly cacheFacade: RedisFacade, // Named facade
        @InjectRedisFacade('session') private readonly sessionFacade: RedisFacade, // Another named facade
    ) {}
}
```

**Parameters:**

- `name?: string` - Tên RedisFacade (case-insensitive, mặc định: 'default')

**Returns:** `ParameterDecorator`

**Example:**

```typescript
// Inject default RedisFacade
@InjectRedisFacade()
private readonly cache: RedisFacade;

// Inject named RedisFacade
@InjectRedisFacade('user-cache')
private readonly userCache: RedisFacade;
```

## Core Classes

### RedisModule

Module chính để tích hợp Redis vào ứng dụng NestJS.

#### Static Methods

##### `forRoot(options: RedisModuleOptions): DynamicModule`

Cấu hình Redis module với options tĩnh.

```typescript
RedisModule.forRoot({
    clients: [
        {
            type: 'single',
            name: 'default',
            host: 'localhost',
            port: 6379,
        },
    ],
});
```

**Parameters:**

- `options: RedisModuleOptions` - Cấu hình Redis module

**Returns:** `DynamicModule`

##### `forRootAsync(options: RedisModuleAsyncOptions): DynamicModule`

Cấu hình Redis module với options bất đồng bộ.

```typescript
RedisModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
        clients: [
            {
                type: 'single',
                name: 'default',
                host: config.get('REDIS_HOST'),
                port: config.get('REDIS_PORT'),
            },
        ],
    }),
});
```

**Parameters:**

- `options: RedisModuleAsyncOptions` - Cấu hình Redis module bất đồng bộ

**Returns:** `DynamicModule`

### RedisService

Service để quản lý các Redis client connections.

#### Methods

##### `get(name?: string): RedisClient`

Lấy Redis client theo tên.

```typescript
const redisClient = this.redisService.get('default');
const cacheClient = this.redisService.get('cache');
```

**Parameters:**

- `name?: string` - Tên Redis client (mặc định: 'default')

**Returns:** `RedisClient`

**Throws:** `Error` nếu client không tồn tại

##### `use(name?: string, prefix?: string): RedisFacade`

Tạo RedisFacade instance với optional key prefix.

```typescript
const cache = this.redisService.use('default', 'app:');
const userCache = this.redisService.use('default', 'user:');
```

**Parameters:**

- `name?: string` - Tên Redis client (mặc định: 'default')
- `prefix?: string` - Key prefix cho tất cả operations

**Returns:** `RedisFacade`

### RedisFacade

Lớp wrapper cao cấp cho Redis với các tính năng nâng cao.

#### Constructor

```typescript
constructor(
  client: RedisClient,
  keyPrefix?: string,
  config?: Partial<RedisFacadeConfig>,
  logger?: Logger
)
```

**Parameters:**

- `client: RedisClient` - Redis client instance
- `keyPrefix?: string` - Prefix cho tất cả keys (mặc định: '')
- `config?: Partial<RedisFacadeConfig>` - Cấu hình tùy chỉnh
- `logger?: Logger` - Logger instance (mặc định: console)

#### Core Methods

##### Basic Operations

| Method                                                        | Description                    | Returns                   |
| ------------------------------------------------------------- | ------------------------------ | ------------------------- |
| `get<T>(key: string)`                                         | Lấy value theo key             | `Promise<T \| null>`      |
| `set(key: string, value: unknown, options?: RedisSetOptions)` | Set value với options          | `Promise<string \| null>` |
| `del(keyOrPattern: string)`                                   | Xóa key hoặc keys theo pattern | `Promise<number>`         |
| `exists(...keys: string[])`                                   | Kiểm tra sự tồn tại của keys   | `Promise<number>`         |
| `expire(key: string, ttlSeconds: number)`                     | Set TTL cho key                | `Promise<boolean>`        |
| `ttl(key: string)`                                            | Lấy TTL của key                | `Promise<number>`         |

##### Hash Operations

| Method                                                     | Description                | Returns              |
| ---------------------------------------------------------- | -------------------------- | -------------------- |
| `hget<T>(key: string, field: string)`                      | Lấy field value từ hash    | `Promise<T \| null>` |
| `hset(key: string, field: string, value: unknown)`         | Set field value trong hash | `Promise<number>`    |
| `hgetall<T>(key: string)`                                  | Lấy tất cả fields từ hash  | `Promise<T>`         |
| `hmsetObject(key: string, obj: Record<string, Primitive>)` | Set multiple fields        | `Promise<'OK'>`      |
| `hmgetObject<T>(key: string, fields: string[])`            | Lấy multiple fields        | `Promise<T>`         |

##### List Operations

| Method                                                | Description               | Returns                     |
| ----------------------------------------------------- | ------------------------- | --------------------------- |
| `lpush(key: string, ...values: unknown[])`            | Push values vào đầu list  | `Promise<number>`           |
| `rpush(key: string, ...values: unknown[])`            | Push values vào cuối list | `Promise<number>`           |
| `lpop<T>(key: string, count?: number)`                | Pop values từ đầu list    | `Promise<T \| T[] \| null>` |
| `rpop<T>(key: string, count?: number)`                | Pop values từ cuối list   | `Promise<T \| T[] \| null>` |
| `lrange<T>(key: string, start: number, stop: number)` | Lấy range của list        | `Promise<T[]>`              |

##### Set Operations

| Method                                     | Description                  | Returns            |
| ------------------------------------------ | ---------------------------- | ------------------ |
| `sadd(key: string, ...members: unknown[])` | Thêm members vào set         | `Promise<number>`  |
| `srem(key: string, ...members: unknown[])` | Xóa members khỏi set         | `Promise<number>`  |
| `smembers<T>(key: string)`                 | Lấy tất cả members của set   | `Promise<T[]>`     |
| `sismember(key: string, member: unknown)`  | Kiểm tra member có trong set | `Promise<boolean>` |

##### Sorted Set Operations

| Method                                                                      | Description             | Returns                                             |
| --------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------- |
| `zadd(key: string, ...scoreMembers: Array<number \| string>)`               | Thêm members với scores | `Promise<number>`                                   |
| `zrange<T>(key: string, start: number, stop: number, withScores?: boolean)` | Lấy range theo index    | `Promise<T[] \| Array<{member: T, score: number}>>` |
| `zscore(key: string, member: unknown)`                                      | Lấy score của member    | `Promise<number \| null>`                           |

##### Advanced Operations

| Method                                                                   | Description                | Returns                      |
| ------------------------------------------------------------------------ | -------------------------- | ---------------------------- |
| `getOrSet<T>(key: string, ttlSeconds: number, loader: () => Promise<T>)` | Cache-Aside pattern        | `Promise<T>`                 |
| `acquireLock(key: string, ttlMs: number)`                                | Acquire distributed lock   | `Promise<LockResult>`        |
| `rateLimit(key: string, limit: number, windowMs: number)`                | Fixed window rate limiting | `Promise<RateLimitResult>`   |
| `executeBatch(operations: BatchOperation[])`                             | Execute batch operations   | `Promise<unknown[]>`         |
| `healthCheck()`                                                          | Basic health check         | `Promise<HealthCheckResult>` |

## Interfaces

### RedisModuleOptions

```typescript
interface RedisModuleOptions {
    clients: RedisClientOptions[];
    logger?: LoggerService;
}
```

**Properties:**

- `clients: RedisClientOptions[]` - Danh sách Redis client configurations
- `logger?: LoggerService` - Optional logger cho connection lifecycle

### RedisModuleAsyncOptions

```typescript
interface RedisModuleAsyncOptions<TArgs extends readonly any[] = readonly any[]>
    extends Pick<ModuleMetadata, 'imports'> {
    inject?: ((new (...args: any[]) => unknown) | string | symbol)[];
    useFactory: (...args: TArgs) => Promise<RedisModuleOptions> | RedisModuleOptions;
    predeclare?: string[];
}
```

**Properties:**

- `inject?: ((new (...args: any[]) => unknown) | string | symbol)[]` - Dependencies để inject vào useFactory
- `useFactory: (...args: TArgs) => Promise<RedisModuleOptions> | RedisModuleOptions` - Factory function để tạo options
- `predeclare?: string[]` - Danh sách client names để predeclare DI tokens

### RedisClientOptions

Union type của tất cả Redis client options:

```typescript
type RedisClientOptions = ClusterClientOptions | SentinelClientOptions | SingleClientOptions;
```

### SingleClientOptions

```typescript
type SingleClientOptions = RedisOptions & {
    name?: string;
    type: 'single';
    connectionString?: string;
};
```

**Properties:**

- `name?: string` - Tên client cho DI
- `type: 'single'` - Loại client (phải là 'single')
- `connectionString?: string` - Connection string hoàn chỉnh

### ClusterClientOptions

```typescript
type ClusterClientOptions = ClusterOptions & {
    name?: string;
    type: 'cluster';
    nodes: Array<ClusterNode | string>;
};
```

**Properties:**

- `name?: string` - Tên client cho DI
- `type: 'cluster'` - Loại client (phải là 'cluster')
- `nodes: Array<ClusterNode | string>` - Danh sách cluster nodes

### SentinelClientOptions

```typescript
type SentinelClientOptions = Omit<RedisOptions, 'name' | 'sentinelPassword' | 'sentinels' | 'sentinelUsername'> & {
    type: 'sentinel';
    name?: string;
    sentinels: SentinelAddress[];
    sentinelName: string;
    sentinelPassword?: string;
    sentinelUsername?: string;
};
```

**Properties:**

- `name?: string` - Tên client cho DI
- `type: 'sentinel'` - Loại client (phải là 'sentinel')
- `sentinels: SentinelAddress[]` - Danh sách sentinel nodes
- `sentinelName: string` - Tên master trong sentinel
- `sentinelPassword?: string` - Password cho sentinel nodes
- `sentinelUsername?: string` - Username cho sentinel nodes

### RedisSetOptions

```typescript
type RedisSetOptions = {
    ttlSeconds?: number; // Expire after N seconds (EX)
    pxMs?: number; // Expire after N milliseconds (PX)
    exAtSec?: number; // Expire at UNIX time in seconds (EXAT)
    pxAtMs?: number; // Expire at UNIX time in milliseconds (PXAT)
    keepTtl?: boolean; // Keep existing TTL (KEEPTTL)
    mode?: 'NX' | 'XX'; // NX: only set if not exists; XX: only set if exists
    get?: boolean; // Return the old value (GET)
};
```

### BatchOperation

```typescript
type BatchOperation = {
    amount?: number;
    key: string;
    operation: 'decr' | 'del' | 'get' | 'incr' | 'set';
    options?: RedisSetOptions;
    value?: unknown;
};
```

### LockResult

```typescript
type LockResult = {
    error?: string;
    ok: boolean;
    release?: () => Promise<boolean>;
    token?: string;
    ttl?: number;
};
```

### RateLimitResult

```typescript
type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    resetTime?: number;
    retryAfter?: number;
};
```

### HealthCheckResult

```typescript
type HealthCheckResult = {
    error?: string;
    latency: number;
    status: 'healthy' | 'unhealthy';
    timestamp: number;
};
```

### CacheStats

```typescript
type CacheStats = {
    hitRate: number;
    memoryUsage: string;
    missRate: number;
    totalKeys: number;
    totalRequests: number;
};
```

## Utility Functions

### checkRedisHealthy

```typescript
export const checkRedisHealthy = async (
  client: Redis,
  key = 'redis'
): Promise<HealthIndicatorResult>
```

Kiểm tra sức khỏe Redis client bằng PING command.

**Parameters:**

- `client: Redis` - Redis client instance
- `key?: string` - Key name cho health check result (mặc định: 'redis')

**Returns:** `Promise<HealthIndicatorResult>`

**Example:**

```typescript
import { checkRedisHealthy } from '@ecom-co/redis';

@Get('health')
async check() {
  return await this.health.check([
    () => checkRedisHealthy(redisClient, 'redis'),
  ]);
}
```

### defineRedisNames

```typescript
export const defineRedisNames = <const T extends readonly string[]>(
  names: T
): { [K in T[number]]: K }
```

Tạo typed map của client names để tránh `as` assertions khi injecting.

**Parameters:**

- `names: T` - Array của client names as const

**Returns:** `{ [K in T[number]]: K }`

**Example:**

```typescript
import { defineRedisNames } from '@ecom-co/redis';

const NAMES = ['FORWARD', 'CACHE'] as const;
const RedisNames = defineRedisNames(NAMES);

// Sử dụng
@InjectRedis(RedisNames.FORWARD)
private readonly forwardRedis: Redis;

@InjectRedis(RedisNames.CACHE)
private readonly cacheRedis: Redis;
```

## Constants

### REDIS_DEFAULT_CLIENT_NAME

```typescript
export const REDIS_DEFAULT_CLIENT_NAME = 'default';
```

Tên mặc định cho Redis client.

### REDIS_MODULE_OPTIONS

```typescript
export const REDIS_MODULE_OPTIONS = Symbol('REDIS_MODULE_OPTIONS');
```

Dependency injection token cho Redis module options.

### getRedisClientToken

```typescript
export const getRedisClientToken = (name?: string): string
```

Lấy DI token cho Redis client theo tên.

**Parameters:**

- `name?: string` - Tên client (case-insensitive)

**Returns:** `string` - DI token

**Example:**

```typescript
const token = getRedisClientToken('cache'); // 'REDIS_CLIENT_CACHE'
const defaultToken = getRedisClientToken(); // 'REDIS_CLIENT'
```

### getRedisFacadeToken

```typescript
export const getRedisFacadeToken = (name?: string): string
```

Lấy DI token cho RedisFacade theo tên.

**Parameters:**

- `name?: string` - Tên facade (case-insensitive)

**Returns:** `string` - DI token

**Example:**

```typescript
const token = getRedisFacadeToken('cache'); // 'REDIS_FACADE_CACHE'
const defaultToken = getRedisFacadeToken(); // 'REDIS_FACADE'
```

## Type Utilities

### RedisClientNamesFromOptions

```typescript
export type RedisClientNamesFromOptions<T extends { clients: ReadonlyArray<{ name?: string }> }> =
    | 'default'
    | Lowercase<Extract<T['clients'][number]['name'], string>>;
```

Derive client name unions từ module options tại compile time.

### RedisClientNamesFromPredeclare

```typescript
export type RedisClientNamesFromPredeclare<TNames extends ReadonlyArray<string>> =
    | 'default'
    | Lowercase<TNames[number]>;
```

Derive client name unions từ predeclare list tại compile time.

## Error Handling

### Common Error Types

| Error Message                             | Cause                              | Solution                                   |
| ----------------------------------------- | ---------------------------------- | ------------------------------------------ |
| `Redis client not found: {name}`          | Client name không tồn tại          | Kiểm tra tên client trong configuration    |
| `Circuit breaker is open for {operation}` | Circuit breaker đã mở              | Đợi timeout hoặc reset circuit breaker     |
| `Failed to acquire lock for key: {key}`   | Không thể acquire distributed lock | Kiểm tra lock TTL hoặc retry               |
| `Rate limit exceeded`                     | Vượt quá rate limit                | Đợi reset time hoặc giảm request frequency |

### Error Handling Best Practices

```typescript
try {
    const result = await this.cache.get('key');
    return result;
} catch (error) {
    // Handle specific error types
    if (error.message.includes('Circuit breaker is open')) {
        // Fallback strategy
        return await this.databaseFallback();
    }

    if (error.message.includes('Rate limit exceeded')) {
        // Rate limit handling
        throw new TooManyRequestsException();
    }

    // Log and rethrow
    this.logger.error('Redis operation failed', error);
    throw error;
}
```

## Performance Considerations

### Batch Operations

Sử dụng batch operations thay vì multiple single operations:

```typescript
// ❌ Không tốt
for (const key of keys) {
    await this.cache.get(key);
}

// ✅ Tốt hơn
await this.cache.mget(keys);
```

### Pipeline Usage

Sử dụng pipeline cho complex operations:

```typescript
const pipeline = this.cache.pipeline();
pipeline.set('key1', 'value1');
pipeline.set('key2', 'value2');
pipeline.get('key3');
const results = await pipeline.exec();
```

### Key Design

Thiết kế keys hợp lý:

```typescript
// ❌ Không tốt
await this.cache.set('user_123_profile_name', 'John');
await this.cache.set('user_123_profile_email', 'john@example.com');

// ✅ Tốt hơn
await this.cache.hmsetObject('user:123:profile', {
    name: 'John',
    email: 'john@example.com',
});
```
