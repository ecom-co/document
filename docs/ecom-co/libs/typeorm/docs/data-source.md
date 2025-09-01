---
id: data-source
title: Data Source — Standalone Connection và Connection Caching
sidebar_label: Data Source
slug: /data-source
description: Data Source module cung cấp standalone database connection cho scripts, CLI tools và migration system với connection caching và management.
tags: [data-source, standalone, connection, caching, migration, seeding]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/Tabs';

:::info
Data Source module cung cấp standalone database connection system cho scripts, CLI tools, migration và seeding, với connection caching và management capabilities.
:::

## Tổng quan

Data Source module bao gồm:

- **Default DataSource** - Cấu hình mặc định cho ứng dụng chính
- **Standalone Connection** - Connection utilities cho scripts và CLI
- **Connection Caching** - Cache connections để tái sử dụng
- **Migration Support** - Hỗ trợ TypeORM migration system
- **Environment Configuration** - Cấu hình từ environment variables

## Default DataSource

### Cấu hình mặc định

```typescript
// src/orm/data-source.ts
const dataSource = new DataSource({
    type: 'postgres',
    entities: CORE_ENTITIES,
    logging: !isProduction,
    migrations: ['src/migrations/*.{ts,js}'],
    migrationsTableName: 'migrations',
    url: databaseUrl,
});
```

### Cấu hình Environment

| Environment Variable | Required | Description                  | Default       |
| -------------------- | -------- | ---------------------------- | ------------- |
| `DATABASE_URL`       | ✅       | PostgreSQL connection string | -             |
| `NODE_ENV`           | ❌       | Environment mode             | `development` |

### Cấu hình tự động

```typescript
// Tự động detect production mode
const isProduction = process.env.NODE_ENV === 'production';

// Logging chỉ bật trong development
logging: !isProduction,

// Sử dụng CORE_ENTITIES từ entities module
entities: CORE_ENTITIES,

// Migration files pattern
migrations: ['src/migrations/*.{ts,js}'],
```

### Sử dụng Default DataSource

```typescript
import dataSource from '@ecom-co/orm/orm/data-source';

// Initialize connection
await dataSource.initialize();

// Use data source
const userRepository = dataSource.getRepository(User);

// Close connection
await dataSource.destroy();
```

## Standalone Connection

### connectStandalone

Function chính để tạo standalone database connection với caching support.

```typescript
export const connectStandalone = async (
  options: DataSourceOptions,
  { reuse = true }: { reuse?: boolean } = {},
): Promise<DataSource>
```

#### Parameters

| Parameter      | Type                | Required | Description                             |
| -------------- | ------------------- | -------- | --------------------------------------- |
| `options`      | `DataSourceOptions` | ✅       | TypeORM data source options             |
| `config.reuse` | `boolean`           | ❌       | Nếu true, tái sử dụng cached connection |

#### Returns

- `Promise<DataSource>` - Initialized và connected data source

#### Ví dụ sử dụng

```typescript
import { connectStandalone } from '@ecom-co/orm';

// Tạo connection mới
const dataSource = await connectStandalone({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, Product],
});

// Sử dụng connection
const userRepo = dataSource.getRepository(User);
const users = await userRepo.find();

// Connection sẽ được cache tự động
```

### Connection Caching

#### Cache Key Generation

```typescript
const getCacheKey = (options: DataSourceOptions): string => options.name ?? 'default';
```

#### Cache Behavior

| Scenario              | Behavior          | Description                           |
| --------------------- | ----------------- | ------------------------------------- |
| **First connection**  | Create new        | Tạo connection mới và cache           |
| **Same options**      | Reuse cached      | Tái sử dụng connection đã cache       |
| **Different options** | Create new        | Tạo connection mới với cache key khác |
| **Cache disabled**    | Always create new | Không sử dụng cache                   |

#### Cache Management

```typescript
// Cache được quản lý tự động
const dataSourceCache = new Map<string, DataSource>();

// Connection được cache theo name hoặc 'default'
if (reuse && dataSourceCache.has(key)) {
    const cached = dataSourceCache.get(key)!;

    if (cached.isInitialized) return cached;

    await cached.initialize();
    return cached;
}
```

### getCachedDataSource

Lấy cached data source theo tên.

```typescript
export const getCachedDataSource = (name = 'default'): DataSource | undefined
```

#### Parameters

| Parameter | Type     | Required | Description                                      |
| --------- | -------- | -------- | ------------------------------------------------ |
| `name`    | `string` | ❌       | Tên của cached data source (mặc định: 'default') |

#### Returns

- `DataSource | undefined` - Cached data source hoặc undefined nếu không tìm thấy

#### Ví dụ sử dụng

```typescript
import { getCachedDataSource } from '@ecom-co/orm';

// Lấy default cached connection
const defaultDs = getCachedDataSource();

// Lấy named connection
const analyticsDs = getCachedDataSource('analytics');

if (defaultDs && defaultDs.isInitialized) {
    // Sử dụng connection
    const userRepo = defaultDs.getRepository(User);
}
```

### disconnectStandalone

Ngắt kết nối cached data source và xóa khỏi cache.

```typescript
export const disconnectStandalone = async (name = 'default'): Promise<void>
```

#### Parameters

| Parameter | Type     | Required | Description                         |
| --------- | -------- | -------- | ----------------------------------- |
| `name`    | `string` | ❌       | Tên của data source để ngắt kết nối |

#### Returns

- `Promise<void>` - Promise resolve khi ngắt kết nối hoàn tất

#### Ví dụ sử dụng

```typescript
import { disconnectStandalone } from '@ecom-co/orm';

// Ngắt kết nối default connection
await disconnectStandalone();

// Ngắt kết nối named connection
await disconnectStandalone('analytics');
```

## Sử dụng trong Scripts

### Migration Scripts

```typescript
import 'reflect-metadata';
import { connectStandalone } from '@ecom-co/orm';
import { User, Product } from '@ecom-co/orm';

async function runMigration() {
    const dataSource = await connectStandalone({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Product],
    });

    try {
        // Run migration logic
        await dataSource.runMigrations();
        console.log('Migration completed successfully');
    } finally {
        // Cleanup
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

runMigration().catch(console.error);
```

### Seeding Scripts

```typescript
import 'reflect-metadata';
import { connectStandalone } from '@ecom-co/orm';
import { User, Product } from '@ecom-co/orm';

async function seedDatabase() {
    const dataSource = await connectStandalone({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Product],
    });

    try {
        const userRepo = dataSource.getRepository(User);
        const productRepo = dataSource.getRepository(Product);

        // Create seed data
        const user = await userRepo.save(
            userRepo.create({
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                isActive: true,
            }),
        );

        await productRepo.save(
            productRepo.create({
                name: 'Sample Product',
                description: 'A sample product for testing',
                isActive: true,
                userId: user.id,
            }),
        );

        console.log('Database seeded successfully');
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    }
}

seedDatabase().catch(console.error);
```

### CLI Tools

```typescript
import 'reflect-metadata';
import { connectStandalone, getCachedDataSource } from '@ecom-co/orm';

async function cliTool() {
    // Kết nối database
    const dataSource = await connectStandalone({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Product],
        name: 'cli-tool', // Named connection
    });

    try {
        // CLI logic
        const userRepo = dataSource.getRepository(User);
        const userCount = await userRepo.count();
        console.log(`Total users: ${userCount}`);

        // Connection được cache, có thể tái sử dụng
        const cachedDs = getCachedDataSource('cli-tool');
        if (cachedDs) {
            console.log('Connection cached successfully');
        }
    } finally {
        // Cleanup
        await disconnectStandalone('cli-tool');
    }
}

cliTool().catch(console.error);
```

## Multiple Data Sources

### Cấu hình nhiều connections

```typescript
import { connectStandalone } from '@ecom-co/orm';

async function setupMultipleConnections() {
    // Primary database
    const primaryDs = await connectStandalone({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Product],
        name: 'primary',
    });

    // Analytics database
    const analyticsDs = await connectStandalone({
        type: 'postgres',
        url: process.env.ANALYTICS_DATABASE_URL,
        entities: [AnalyticsEvent],
        name: 'analytics',
    });

    // Test database
    const testDs = await connectStandalone({
        type: 'postgres',
        url: process.env.TEST_DATABASE_URL,
        entities: [User, Product],
        name: 'test',
    });

    return { primaryDs, analyticsDs, testDs };
}
```

### Sử dụng named connections

```typescript
import { getCachedDataSource } from '@ecom-co/orm';

async function useNamedConnections() {
    const primaryDs = getCachedDataSource('primary');
    const analyticsDs = getCachedDataSource('analytics');

    if (primaryDs && analyticsDs) {
        // Sử dụng primary database
        const userRepo = primaryDs.getRepository(User);
        const users = await userRepo.find();

        // Sử dụng analytics database
        const eventRepo = analyticsDs.getRepository(AnalyticsEvent);
        const events = await eventRepo.find();
    }
}
```

## Environment Configuration

### .env file

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/main_db

# Multiple databases
ANALYTICS_DATABASE_URL=postgresql://username:password@localhost:5432/analytics_db
TEST_DATABASE_URL=postgresql://username:5432/test_db

# Environment
NODE_ENV=development

# Optional: Custom settings
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=username
DB_PASSWORD=password
DB_DATABASE=main_db
```

### Environment-specific configuration

```typescript
import 'dotenv/config';

const getDatabaseConfig = () => {
    const env = process.env.NODE_ENV || 'development';

    switch (env) {
        case 'production':
            return {
                logging: false,
                ssl: { rejectUnauthorized: false },
            };

        case 'test':
            return {
                logging: false,
                dropSchema: true,
            };

        default: // development
            return {
                logging: true,
                synchronize: false,
            };
    }
};

const dataSource = await connectStandalone({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, Product],
    ...getDatabaseConfig(),
});
```

## Best Practices

:::tip
**Use Named Connections**: Sử dụng named connections cho multiple data sources để dễ quản lý.
:::

:::tip
**Connection Reuse**: Luôn sử dụng `reuse: true` (mặc định) để tối ưu performance.
:::

:::tip
**Proper Cleanup**: Luôn gọi `disconnectStandalone` hoặc `dataSource.destroy()` để cleanup connections.
:::

:::warning
**Environment Variables**: Đảm bảo `DATABASE_URL` được set trong environment trước khi sử dụng.
:::

:::info
**Migration Support**: Standalone connections hỗ trợ đầy đủ TypeORM migration system.
:::

## Ví dụ hoàn chỉnh

### Migration Runner

```typescript
import 'reflect-metadata';
import { connectStandalone, disconnectStandalone } from '@ecom-co/orm';
import { User, Product } from '@ecom-co/orm';

async function runMigrations() {
    const dataSource = await connectStandalone({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Product],
        name: 'migration-runner',
    });

    try {
        console.log('Running migrations...');

        // Check if migrations are pending
        const pendingMigrations = await dataSource.showMigrations();

        if (pendingMigrations) {
            await dataSource.runMigrations();
            console.log('Migrations completed successfully');
        } else {
            console.log('No pending migrations');
        }
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        await disconnectStandalone('migration-runner');
    }
}

// CLI usage
if (require.main === module) {
    runMigrations().catch((error) => {
        console.error('Migration script failed:', error);
        process.exit(1);
    });
}
```

### Database Seeder

```typescript
import 'reflect-metadata';
import { connectStandalone, disconnectStandalone } from '@ecom-co/orm';
import { User, Product } from '@ecom-co/orm';

async function seedDatabase() {
    const dataSource = await connectStandalone({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Product],
        name: 'seeder',
    });

    try {
        console.log('Seeding database...');

        const userRepo = dataSource.getRepository(User);
        const productRepo = dataSource.getRepository(Product);

        // Check if data already exists
        const existingUsers = await userRepo.count();
        if (existingUsers > 0) {
            console.log('Database already seeded, skipping...');
            return;
        }

        // Create admin user
        const adminUser = await userRepo.save(
            userRepo.create({
                email: 'admin@example.com',
                firstName: 'Admin',
                lastName: 'User',
                isActive: true,
            }),
        );

        // Create sample products
        const products = [
            {
                name: 'Sample Product 1',
                description: 'First sample product',
                isActive: true,
                userId: adminUser.id,
            },
            {
                name: 'Sample Product 2',
                description: 'Second sample product',
                isActive: true,
                userId: adminUser.id,
            },
        ];

        await productRepo.save(products.map((product) => productRepo.create(product)));

        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    } finally {
        await disconnectStandalone('seeder');
    }
}

// CLI usage
if (require.main === module) {
    seedDatabase().catch((error) => {
        console.error('Seeding script failed:', error);
        process.exit(1);
    });
}
```

### Database Health Checker

```typescript
import 'reflect-metadata';
import { connectStandalone, getCachedDataSource } from '@ecom-co/orm';

async function checkDatabaseHealth() {
    try {
        // Try to get cached connection first
        let dataSource = getCachedDataSource('health-checker');

        if (!dataSource) {
            // Create new connection if not cached
            dataSource = await connectStandalone({
                type: 'postgres',
                url: process.env.DATABASE_URL,
                entities: [User, Product],
                name: 'health-checker',
            });
        }

        // Simple health check query
        const startTime = Date.now();
        await dataSource.query('SELECT 1');
        const latency = Date.now() - startTime;

        console.log(`Database health check passed. Latency: ${latency}ms`);
        return { status: 'healthy', latency };
    } catch (error) {
        console.error('Database health check failed:', error.message);
        return { status: 'unhealthy', error: error.message };
    }
}

// Run health check
checkDatabaseHealth().then((result) => {
    if (result.status === 'healthy') {
        process.exit(0);
    } else {
        process.exit(1);
    }
});
```
