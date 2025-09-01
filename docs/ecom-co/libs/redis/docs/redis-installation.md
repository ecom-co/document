---
id: redis-installation
title: Redis Module Installation & Development
sidebar_label: Installation & Development
slug: /redis-installation
description: Hướng dẫn cài đặt, cấu hình và phát triển với Redis module.
tags: [installation, development, configuration, setup, redis-module]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::info
Tài liệu này hướng dẫn cách cài đặt, cấu hình và phát triển với Redis module. Bao gồm các bước setup, development workflow và deployment.
:::

## Cài đặt

### 1. Yêu cầu hệ thống

- **Node.js**: >= 18.0.0
- **NestJS**: >= 10.0.0
- **Redis Server**: >= 6.0.0
- **TypeScript**: >= 5.0.0

### 2. Cài đặt package

```bash
# Sử dụng npm
npm install @ecom-co/redis

# Sử dụng yarn
yarn add @ecom-co/redis

# Sử dụng pnpm
pnpm add @ecom-co/redis
```

### 3. Cài đặt dependencies

```bash
# Core dependencies
npm install ioredis

# Optional dependencies
npm install @nestjs/terminus  # Cho health checks
npm install @nestjs/schedule  # Cho background jobs
```

### 4. Cài đặt Redis Server

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

#### macOS

```bash
# Sử dụng Homebrew
brew install redis
brew services start redis

# Hoặc sử dụng Docker
docker run -d -p 6379:6379 redis:7-alpine
```

#### Windows

```bash
# Sử dụng WSL2 hoặc Docker
docker run -d -p 6379:6379 redis:7-alpine
```

#### Docker Compose

```yaml
version: '3.8'
services:
    redis:
        image: redis:7-alpine
        ports:
            - '6379:6379'
        volumes:
            - redis_data:/data
        command: redis-server --appendonly yes
        restart: unless-stopped

    redis-cluster:
        image: redis:7-alpine
        ports:
            - '7000:7000'
            - '7001:7001'
            - '7002:7002'
        volumes:
            - ./redis-cluster.conf:/usr/local/etc/redis/redis.conf
        command: redis-server /usr/local/etc/redis/redis.conf

volumes:
    redis_data:
```

## Cấu hình cơ bản

### 1. Environment Variables

Tạo file `.env` trong project root:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Redis Cluster (optional)
REDIS_CLUSTER_NODES=localhost:7000,localhost:7001,localhost:7002

# Redis Sentinel (optional)
REDIS_SENTINEL_HOSTS=localhost:26379,localhost:26380,localhost:26381
REDIS_SENTINEL_NAME=mymaster
REDIS_SENTINEL_PASSWORD=
REDIS_SENTINEL_USERNAME=

# Application Configuration
NODE_ENV=development
REDIS_KEY_PREFIX=app:
REDIS_CONNECTION_TIMEOUT=10000
REDIS_COMMAND_TIMEOUT=5000
```

### 2. Configuration Service

Tạo configuration service để quản lý Redis settings:

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RedisConfigService {
    constructor(private configService: ConfigService) {}

    get redisConfig() {
        return {
            clients: [
                {
                    type: 'single' as const,
                    name: 'default',
                    host: this.configService.get('REDIS_HOST', 'localhost'),
                    port: this.configService.get('REDIS_PORT', 6379),
                    password: this.configService.get('REDIS_PASSWORD'),
                    db: this.configService.get('REDIS_DB', 0),
                    keyPrefix: this.configService.get('REDIS_KEY_PREFIX', ''),
                    connectTimeout: this.configService.get('REDIS_CONNECTION_TIMEOUT', 10000),
                    commandTimeout: this.configService.get('REDIS_COMMAND_TIMEOUT', 5000),
                },
            ],
        };
    }

    get clusterConfig() {
        const nodes = this.configService.get('REDIS_CLUSTER_NODES', 'localhost:7000');

        return {
            clients: [
                {
                    type: 'cluster' as const,
                    name: 'cluster',
                    nodes: nodes.split(',').map((node) => {
                        const [host, port] = node.split(':');
                        return { host, port: parseInt(port) };
                    }),
                },
            ],
        };
    }

    get sentinelConfig() {
        const hosts = this.configService.get('REDIS_SENTINEL_HOSTS', 'localhost:26379');

        return {
            clients: [
                {
                    type: 'sentinel' as const,
                    name: 'sentinel',
                    sentinels: hosts.split(',').map((host) => {
                        const [hostname, port] = host.split(':');
                        return { host: hostname, port: parseInt(port) };
                    }),
                    sentinelName: this.configService.get('REDIS_SENTINEL_NAME', 'mymaster'),
                    sentinelPassword: this.configService.get('REDIS_SENTINEL_PASSWORD'),
                    sentinelUsername: this.configService.get('REDIS_SENTINEL_USERNAME'),
                },
            ],
        };
    }
}
```

### 3. App Module Configuration

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@ecom-co/redis';
import { RedisConfigService } from './config/redis-config.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        RedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [RedisConfigService],
            useFactory: (config: RedisConfigService) => config.redisConfig,
        }),
    ],
})
export class AppModule {}
```

## Development Setup

### 1. Development Scripts

Thêm scripts vào `package.json`:

```json
{
    "scripts": {
        "dev": "nest start --watch",
        "dev:debug": "nest start --debug --watch",
        "build": "nest build",
        "start": "node dist/main",
        "start:prod": "node dist/main",
        "redis:start": "docker run -d -p 6379:6379 redis:7-alpine",
        "redis:stop": "docker stop $(docker ps -q --filter ancestor=redis:7-alpine)",
        "redis:cli": "docker exec -it $(docker ps -q --filter ancestor=redis:7-alpine) redis-cli",
        "test": "jest",
        "test:watch": "jest --watch",
        "test:cov": "jest --coverage",
        "test:e2e": "jest --config ./test/jest-e2e.json"
    }
}
```

### 2. Development Configuration

Tạo file `config/redis.config.ts` cho development:

```typescript
import { RedisModuleOptions } from '@ecom-co/redis';

export const redisDevelopmentConfig: RedisModuleOptions = {
    clients: [
        {
            type: 'single',
            name: 'default',
            host: 'localhost',
            port: 6379,
            keyPrefix: 'dev:',
            lazyConnect: true, // Chỉ connect khi cần
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
        },
        {
            type: 'single',
            name: 'cache',
            host: 'localhost',
            port: 6379,
            keyPrefix: 'cache:',
            db: 1,
        },
        {
            type: 'single',
            name: 'session',
            host: 'localhost',
            port: 6379,
            keyPrefix: 'session:',
            db: 2,
        },
    ],
    logger: console, // Sử dụng console logger cho development
};
```

### 3. Hot Reload Configuration

Cấu hình hot reload cho development:

```typescript
// main.ts
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    if (process.env.NODE_ENV === 'development') {
        // Enable hot reload
        if (module.hot) {
            module.hot.accept();
            module.hot.dispose(() => app.close());
        }
    }

    await app.listen(3000);
}
```

## Testing Setup

### 1. Test Configuration

Tạo file `test/redis-test.config.ts`:

```typescript
import { RedisModuleOptions } from '@ecom-co/redis';

export const redisTestConfig: RedisModuleOptions = {
    clients: [
        {
            type: 'single',
            name: 'default',
            host: 'localhost',
            port: 6379,
            keyPrefix: 'test:',
            db: 15, // Sử dụng database riêng cho testing
            lazyConnect: true,
        },
    ],
};
```

### 2. Test Utilities

Tạo file `test/redis-test.utils.ts`:

```typescript
import { RedisFacade } from '@ecom-co/redis';
import Redis from 'ioredis';

export class RedisTestUtils {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            host: 'localhost',
            port: 6379,
            db: 15,
            keyPrefix: 'test:',
        });
    }

    async cleanup() {
        const keys = await this.redis.keys('*');
        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }

    async createTestData(key: string, value: any) {
        await this.redis.set(key, JSON.stringify(value));
    }

    async getTestData(key: string) {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
    }

    async disconnect() {
        await this.redis.disconnect();
    }
}
```

### 3. Test Examples

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from '@ecom-co/redis';
import { CacheService } from './cache.service';
import { redisTestConfig } from '../test/redis-test.config';
import { RedisTestUtils } from '../test/redis-test.utils';

describe('CacheService', () => {
    let service: CacheService;
    let testUtils: RedisTestUtils;

    beforeAll(async () => {
        testUtils = new RedisTestUtils();
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RedisModule.forRoot(redisTestConfig)],
            providers: [CacheService],
        }).compile();

        service = module.get<CacheService>(CacheService);
        await testUtils.cleanup();
    });

    afterEach(async () => {
        await testUtils.cleanup();
    });

    afterAll(async () => {
        await testUtils.disconnect();
    });

    it('should cache and retrieve data', async () => {
        const testData = { id: 1, name: 'Test User' };
        const key = 'user:1';

        // Set data
        await service.set(key, testData);

        // Get data
        const retrieved = await service.get(key);

        expect(retrieved).toEqual(testData);
    });
});
```

## Production Configuration

### 1. Production Environment Variables

```env
# Production Redis Configuration
REDIS_HOST=redis.production.com
REDIS_PORT=6379
REDIS_PASSWORD=strong_password_here
REDIS_DB=0
REDIS_KEY_PREFIX=prod:
REDIS_CONNECTION_TIMEOUT=30000
REDIS_COMMAND_TIMEOUT=10000

# Redis Cluster Configuration
REDIS_CLUSTER_ENABLED=true
REDIS_CLUSTER_NODES=redis-1:7000,redis-2:7000,redis-3:7000

# Redis Sentinel Configuration
REDIS_SENTINEL_ENABLED=false
REDIS_SENTINEL_HOSTS=localhost:26379
REDIS_SENTINEL_NAME=mymaster

# Application Configuration
NODE_ENV=production
REDIS_MAX_MEMORY=2gb
REDIS_EVICTION_POLICY=allkeys-lru
```

### 2. Production Redis Configuration

```typescript
import { RedisModuleOptions } from '@ecom-co/redis';

export const redisProductionConfig: RedisModuleOptions = {
    clients: [
        {
            type: 'cluster',
            name: 'default',
            nodes: [
                { host: 'redis-1', port: 7000 },
                { host: 'redis-2', port: 7000 },
                { host: 'redis-3', port: 7000 },
            ],
            keyPrefix: 'prod:',
            connectTimeout: 30000,
            commandTimeout: 10000,
            retryDelayOnFailover: 1000,
            maxRetriesPerRequest: 5,
            enableOfflineQueue: false,
            enableReadyCheck: true,
            maxLoadingTimeout: 30000,
        },
    ],
    logger: {
        log: (message: string) => console.log(`[REDIS] ${message}`),
        error: (message: string, error?: any) => console.error(`[REDIS] ${message}`, error),
        warn: (message: string) => console.warn(`[REDIS] ${message}`),
        debug: (message: string) => console.debug(`[REDIS] ${message}`),
        verbose: (message: string) => console.log(`[REDIS] ${message}`),
    },
};
```

### 3. Health Check Configuration

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RedisModule } from '@ecom-co/redis';
import { HealthController } from './health/health.controller';
import { redisProductionConfig } from './config/redis-production.config';

@Module({
    imports: [TerminusModule, RedisModule.forRoot(redisProductionConfig)],
    controllers: [HealthController],
})
export class AppModule {}
```

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { InjectRedis } from '@ecom-co/redis';
import { checkRedisHealthy } from '@ecom-co/redis';
import type { Redis } from 'ioredis';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        @InjectRedis() private readonly redis: Redis,
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([() => checkRedisHealthy(this.redis, 'redis')]);
    }
}
```

## Monitoring & Logging

### 1. Redis Monitoring

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRedisFacade } from '@ecom-co/redis';
import { RedisFacade } from '@ecom-co/redis';

@Injectable()
export class RedisMonitoringService {
    private readonly logger = new Logger(RedisMonitoringService.name);

    constructor(@InjectRedisFacade() private readonly cache: RedisFacade) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async monitorRedisHealth() {
        try {
            const health = await this.cache.healthCheck();

            if (health.status === 'unhealthy') {
                this.logger.error(`Redis unhealthy: ${health.error}`);
                // Send alert to monitoring system
                await this.sendAlert('ERROR', 'Redis is unhealthy', health);
            }

            if (health.latency > 100) {
                this.logger.warn(`Redis latency high: ${health.latency}ms`);
                await this.sendAlert('WARNING', 'Redis latency is high', health);
            }
        } catch (error) {
            this.logger.error('Redis monitoring failed', error);
        }
    }

    @Cron(CronExpression.EVERY_5_MINUTES)
    async monitorRedisStats() {
        try {
            const stats = await this.cache.getCacheStats();

            this.logger.log(
                `Redis Stats - Hit Rate: ${stats.hitRate}%, Memory: ${stats.memoryUsage}, Keys: ${stats.totalKeys}`,
            );

            if (stats.hitRate < 80) {
                await this.sendAlert('WARNING', 'Cache hit rate is low', stats);
            }
        } catch (error) {
            this.logger.error('Redis stats monitoring failed', error);
        }
    }

    private async sendAlert(level: string, message: string, context: any) {
        // Implement alert sending logic
        this.logger.log(`ALERT [${level}]: ${message}`, context);
    }
}
```

### 2. Logging Configuration

```typescript
import { LoggerService } from '@nestjs/common';

export class RedisLogger implements LoggerService {
    log(message: string, context?: string) {
        console.log(`[REDIS] ${message}`, context);
    }

    error(message: string, trace?: string, context?: string) {
        console.error(`[REDIS ERROR] ${message}`, trace, context);
    }

    warn(message: string, context?: string) {
        console.warn(`[REDIS WARN] ${message}`, context);
    }

    debug(message: string, context?: string) {
        console.debug(`[REDIS DEBUG] ${message}`, context);
    }

    verbose(message: string, context?: string) {
        console.log(`[REDIS VERBOSE] ${message}`, context);
    }
}
```

## Deployment

### 1. Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY .env.production ./.env

EXPOSE 3000

CMD ["node", "dist/main"]
```

### 2. Docker Compose Production

```yaml
version: '3.8'
services:
    app:
        build: .
        ports:
            - '3000:3000'
        environment:
            - NODE_ENV=production
            - REDIS_HOST=redis
        depends_on:
            - redis
        restart: unless-stopped

    redis:
        image: redis:7-alpine
        ports:
            - '6379:6379'
        volumes:
            - redis_data:/data
        command: redis-server --appendonly yes --maxmemory 2gb --maxmemory-policy allkeys-lru
        restart: unless-stopped

volumes:
    redis_data:
```

### 3. Kubernetes Configuration

```yaml
# redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: redis
spec:
    replicas: 3
    selector:
        matchLabels:
            app: redis
    template:
        metadata:
            labels:
                app: redis
        spec:
            containers:
                - name: redis
                  image: redis:7-alpine
                  ports:
                      - containerPort: 6379
                  resources:
                      requests:
                          memory: '512Mi'
                          cpu: '250m'
                      limits:
                          memory: '1Gi'
                          cpu: '500m'
                  volumeMounts:
                      - name: redis-data
                        mountPath: /data
            volumes:
                - name: redis-data
                  emptyDir: {}

---
apiVersion: v1
kind: Service
metadata:
    name: redis
spec:
    selector:
        app: redis
    ports:
        - port: 6379
          targetPort: 6379
    type: ClusterIP
```

## Troubleshooting

### 1. Common Issues

#### Connection Issues

```bash
# Kiểm tra Redis server
redis-cli ping

# Kiểm tra connection
redis-cli -h localhost -p 6379 ping

# Kiểm tra logs
docker logs <redis-container-id>
```

#### Memory Issues

```bash
# Kiểm tra memory usage
redis-cli info memory

# Kiểm tra keys
redis-cli dbsize

# Clear database (cẩn thận!)
redis-cli flushdb
```

#### Performance Issues

```bash
# Kiểm tra slow queries
redis-cli slowlog get 10

# Kiểm tra latency
redis-cli --latency

# Monitor commands
redis-cli monitor
```

### 2. Debug Configuration

```typescript
// config/redis-debug.config.ts
export const redisDebugConfig: RedisModuleOptions = {
    clients: [
        {
            type: 'single',
            name: 'default',
            host: 'localhost',
            port: 6379,
            keyPrefix: 'debug:',
            lazyConnect: true,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 1,
            enableOfflineQueue: false,
            enableReadyCheck: false,
            // Debug options
            debug: true,
            showFriendlyErrorStack: true,
        },
    ],
    logger: {
        log: (message: string) => console.log(`[REDIS DEBUG] ${message}`),
        error: (message: string, error?: any) => console.error(`[REDIS DEBUG ERROR] ${message}`, error),
        warn: (message: string) => console.warn(`[REDIS DEBUG WARN] ${message}`),
        debug: (message: string) => console.debug(`[REDIS DEBUG DEBUG] ${message}`),
        verbose: (message: string) => console.log(`[REDIS DEBUG VERBOSE] ${message}`),
    },
};
```

:::tip
**Development Tip**: Sử dụng `lazyConnect: true` trong development để tránh connection errors khi Redis chưa sẵn sàng.
:::

:::warning
**Production Warning**: Luôn sử dụng strong passwords và network security cho Redis trong production environment.
:::

:::info
**Monitoring Tip**: Implement comprehensive monitoring và alerting cho Redis operations để detect issues sớm.
:::
