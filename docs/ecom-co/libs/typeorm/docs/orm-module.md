---
id: orm-module
title: ORM Module — NestJS Integration với Health Check
sidebar_label: ORM Module
slug: /orm-module
description: ORM Module là wrapper cho NestJS TypeORM với các tính năng nâng cao như health check, global module support và extended repository providers.
tags: [orm-module, nestjs, health-check, global-module, async-configuration]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/Tabs';

:::info
ORM Module là wrapper cho NestJS TypeORM module, cung cấp các tính năng nâng cao như health check capabilities, global module support, async configuration và extended repository providers.
:::

## Tổng quan

ORM Module bao gồm:

- **OrmModule** - Global NestJS module với TypeORM integration
- **Health Check** - Database health monitoring với latency measurement
- **Global Module** - Available trong toàn bộ application
- **Async Configuration** - Dynamic configuration từ ConfigService
- **Extended Repository** - Tự động tạo BaseRepository providers

## OrmModule

`OrmModule` là global NestJS module wrapper cho TypeORM với các tính năng nâng cao.

### Decorators

```typescript
@Global()
@Module({})
export class OrmModule
```

- **@Global()** - Module có sẵn trong toàn bộ application
- **@Module({})** - Empty module, tất cả logic trong static methods

## Static Methods

### forRoot

Cấu hình TypeORM module đồng bộ với health check option.

```typescript
static forRoot(options: OrmModuleOptions): DynamicModule
```

#### Parameters

| Parameter | Type               | Required | Description                              |
| --------- | ------------------ | -------- | ---------------------------------------- |
| `options` | `OrmModuleOptions` | ✅       | Cấu hình TypeORM với health check option |

#### OrmModuleOptions

```typescript
export type OrmModuleOptions = TypeOrmModuleOptions & {
    /** Nếu true, cung cấp health check provider cho database connection */
    health?: boolean;
};
```

#### Returns

- `DynamicModule` - Module đã được cấu hình với health check provider (nếu bật)

#### Ví dụ sử dụng

```typescript
import { Module } from '@nestjs/common';
import { OrmModule } from '@ecom-co/orm';
import { User, Product } from '@ecom-co/orm';

@Module({
    imports: [
        OrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, Product],
            health: true, // Bật health check
        }),
    ],
})
export class AppModule {}
```

### forRootAsync

Cấu hình TypeORM module bất đồng bộ với health check option.

```typescript
static forRootAsync(options: OrmModuleAsyncOptions): DynamicModule
```

#### Parameters

| Parameter | Type                    | Required | Description                                    |
| --------- | ----------------------- | -------- | ---------------------------------------------- |
| `options` | `OrmModuleAsyncOptions` | ✅       | Cấu hình TypeORM async với health check option |

#### OrmModuleAsyncOptions

```typescript
export type OrmModuleAsyncOptions = TypeOrmModuleAsyncOptions & {
    /** Nếu true, cung cấp health check provider cho database connection */
    health?: boolean;
};
```

#### Returns

- `DynamicModule` - Module đã được cấu hình với async configuration và health check provider

#### Ví dụ sử dụng

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrmModule } from '@ecom-co/orm';
import { User, Product } from '@ecom-co/orm';

@Module({
    imports: [
        ConfigModule.forRoot(),
        OrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                url: config.get('DATABASE_URL'),
                entities: [User, Product],
                health: true, // Bật health check
            }),
        }),
    ],
})
export class AppModule {}
```

### forFeature

Đăng ký entities cho feature module (tương tự TypeOrmModule.forFeature).

```typescript
static forFeature = (
  entities: EntityClassOrSchema[],
  dataSource?: string
): DynamicModule
```

#### Parameters

| Parameter    | Type                    | Required | Description                               |
| ------------ | ----------------------- | -------- | ----------------------------------------- |
| `entities`   | `EntityClassOrSchema[]` | ✅       | Mảng entities để đăng ký                  |
| `dataSource` | `string`                | ❌       | Tên data source connection (nếu có nhiều) |

#### Returns

- `DynamicModule` - Feature module với entities đã đăng ký

#### Ví dụ sử dụng

```typescript
import { Module } from '@nestjs/common';
import { OrmModule } from '@ecom-co/orm';
import { User } from '@ecom-co/orm';

@Module({
    imports: [OrmModule.forFeature([User])],
})
export class UserModule {}
```

### forFeatureExtended

Đăng ký entities và cung cấp extended `BaseRepository` cho chúng.

```typescript
static forFeatureExtended = (
  entities: EntityClassOrSchema[],
  dataSource?: string
): DynamicModule
```

#### Parameters

| Parameter    | Type                    | Required | Description                               |
| ------------ | ----------------------- | -------- | ----------------------------------------- |
| `entities`   | `EntityClassOrSchema[]` | ✅       | Mảng entities để đăng ký                  |
| `dataSource` | `string`                | ❌       | Tên data source connection (nếu có nhiều) |

#### Returns

- `DynamicModule` - Feature module với BaseRepository providers

#### Ví dụ sử dụng

```typescript
import { Module } from '@nestjs/common';
import { OrmModule } from '@ecom-co/orm';
import { User, Product } from '@ecom-co/orm';

@Module({
    imports: [
        OrmModule.forFeatureExtended([User, Product]), // Tự động tạo BaseRepository providers
    ],
})
export class CoreModule {}
```

## Health Check

### Health Check Provider

Khi bật `health: true`, OrmModule tự động tạo health check provider:

```typescript
export const ORM_HEALTH_CHECK = Symbol('ORM_HEALTH_CHECK');
```

### Health Check Function

```typescript
export type OrmHealthCheckFn = (key?: string) => Promise<HealthIndicatorResult>;
```

### Health Check Implementation

```typescript
export const checkTypeOrmHealthy = async (
  dataSource: DataSource,
  key: string = ORM_HEALTH_KEY,
): Promise<HealthIndicatorResult>
```

#### Parameters

| Parameter    | Type         | Required | Description                            |
| ------------ | ------------ | -------- | -------------------------------------- |
| `dataSource` | `DataSource` | ✅       | TypeORM DataSource instance            |
| `key`        | `string`     | ❌       | Key cho health status (mặc định: 'db') |

#### Returns

- `HealthIndicatorResult` - Health check result với status và latency

#### Health Check Result

```typescript
export type HealthIndicatorResult = Record<
    string,
    {
        [k: string]: unknown;
        latencyMs: number;
        status: 'down' | 'up';
    }
>;
```

#### Ví dụ Result

```typescript
// Success case
{
  db: {
    status: 'up',
    latencyMs: 12
  }
}

// Error case
{
  db: {
    status: 'down',
    error: 'Connection failed',
    latencyMs: 150
  }
}
```

### Sử dụng Health Check

#### 1. Inject Health Check Provider

```typescript
import { Injectable } from '@nestjs/common';
import { ORM_HEALTH_CHECK, OrmHealthCheckFn } from '@ecom-co/orm';

@Injectable()
export class HealthService {
    constructor(
        @Inject(ORM_HEALTH_CHECK)
        private healthCheck: OrmHealthCheckFn,
    ) {}

    async checkDatabaseHealth(): Promise<any> {
        return this.healthCheck('database');
    }
}
```

#### 2. Sử dụng trong Terminus Health Check

```typescript
import { Injectable } from '@nestjs/terminus';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ORM_HEALTH_CHECK, OrmHealthCheckFn } from '@ecom-co/orm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
    constructor(
        @Inject(ORM_HEALTH_CHECK)
        private healthCheck: OrmHealthCheckFn,
    ) {
        super();
    }

    async isHealthy(key: string): Promise<HealthIndicatorResult> {
        try {
            const result = await this.healthCheck(key);
            return result;
        } catch (error) {
            return this.getStatus(key, false, { message: error.message });
        }
    }
}
```

#### 3. Health Controller

```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './database.health';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: DatabaseHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([() => this.db.isHealthy('database')]);
    }
}
```

## Multiple Data Sources

### Cấu hình nhiều Data Sources

```typescript
import { Module } from '@nestjs/common';
import { OrmModule } from '@ecom-co/orm';

@Module({
    imports: [
        // Primary database
        OrmModule.forRoot({
            name: 'default',
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, Product],
            health: true,
        }),

        // Analytics database
        OrmModule.forRoot({
            name: 'analytics',
            type: 'postgres',
            url: process.env.ANALYTICS_DATABASE_URL,
            entities: [AnalyticsEvent],
            health: true,
        }),
    ],
})
export class AppModule {}
```

### Sử dụng trong Feature Modules

```typescript
import { Module } from '@nestjs/common';
import { OrmModule } from '@ecom-co/orm';

@Module({
    imports: [
        // Sử dụng default data source
        OrmModule.forFeature([User], 'default'),

        // Sử dụng analytics data source
        OrmModule.forFeature([AnalyticsEvent], 'analytics'),
    ],
})
export class AnalyticsModule {}
```

## Ví dụ hoàn chỉnh

### App Module với Health Check

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { OrmModule } from '@ecom-co/orm';
import { User, Product, CORE_ENTITIES } from '@ecom-co/orm';
import { HealthController } from './health.controller';
import { DatabaseHealthIndicator } from './database.health';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TerminusModule,

        // ORM Module với health check
        OrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                url: config.get('DATABASE_URL'),
                entities: CORE_ENTITIES,
                health: true, // Bật health check
                logging: config.get('NODE_ENV') !== 'production',
            }),
        }),
    ],
    controllers: [HealthController],
    providers: [DatabaseHealthIndicator],
})
export class AppModule {}
```

### Feature Module với Extended Repository

```typescript
import { Module } from '@nestjs/common';
import { OrmModule } from '@ecom-co/orm';
import { User, Product } from '@ecom-co/orm';
import { UserService } from './user.service';
import { ProductService } from './product.service';

@Module({
    imports: [
        // Sử dụng extended repository
        OrmModule.forFeatureExtended([User, Product]),
    ],
    providers: [UserService, ProductService],
    exports: [UserService, ProductService],
})
export class CoreModule {}
```

### Service với BaseRepository

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '@ecom-co/orm';
import { User } from '@ecom-co/orm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: BaseRepository<User>, // Sử dụng BaseRepository
    ) {}

    async findOrCreate(email: string): Promise<User> {
        return this.userRepo.findOneOrCreate({ email }, { isActive: true });
    }

    async updateOrCreate(email: string, userData: Partial<User>): Promise<User> {
        return this.userRepo.findOneAndUpdate({ email }, userData, { upsert: true });
    }
}
```

## Best Practices

:::tip
**Use Health Check**: Luôn bật health check trong production để monitor database health.
:::

:::tip
**Global Module**: OrmModule là global module, không cần import lại trong các feature modules.
:::

:::tip
**forFeatureExtended**: Sử dụng `forFeatureExtended` khi cần BaseRepository methods.
:::

:::warning
**Multiple Data Sources**: Khi sử dụng nhiều data sources, đảm bảo đặt tên rõ ràng và sử dụng đúng tên trong feature modules.
:::

:::info
**Async Configuration**: Sử dụng `forRootAsync` khi cần dynamic configuration từ ConfigService hoặc external sources.
:::

## Migration từ TypeOrmModule

### Thay thế TypeOrmModule.forRoot

```typescript
// ❌ Cũ
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, Product],
        }),
    ],
})
export class AppModule {}

// ✅ Mới
import { OrmModule } from '@ecom-co/orm';

@Module({
    imports: [
        OrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, Product],
            health: true, // Thêm health check
        }),
    ],
})
export class AppModule {}
```

### Thay thế TypeOrmModule.forFeature

```typescript
// ❌ Cũ
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([User, Product])],
})
export class UserModule {}

// ✅ Mới - Standard repository
import { OrmModule } from '@ecom-co/orm';

@Module({
    imports: [OrmModule.forFeature([User, Product])],
})
export class UserModule {}

// ✅ Mới - Extended repository
@Module({
    imports: [OrmModule.forFeatureExtended([User, Product])],
})
export class UserModule {}
```
