---
id: core-module
title: Core Module — TypeORM Exports và Utilities
sidebar_label: Core Module
slug: /core-module
description: Core Module cung cấp các exports từ TypeORM và NestJS TypeORM, cùng với các utility functions để tạo TypeORM modules.
tags: [core, typeorm, nestjs, utilities, modules]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/Tabs';

:::info
Core Module là module cơ bản nhất, export tất cả các thành phần từ TypeORM và NestJS TypeORM, cùng với các utility functions để tạo TypeORM modules một cách dễ dàng.
:::

## Tổng quan

Core Module cung cấp:

- **TypeORM exports** - Tất cả các class, decorators và functions từ TypeORM
- **NestJS TypeORM exports** - Các module và providers từ @nestjs/typeorm
- **Utility functions** - Helper functions để tạo TypeORM modules

## Exports

### TypeORM Exports

```typescript
export * from 'typeorm';
```

Bao gồm tất cả các thành phần từ TypeORM:

- `Entity`, `Column`, `PrimaryGeneratedColumn`, etc.
- `DataSource`, `Repository`, `QueryBuilder`
- `MigrationInterface`, `QueryRunner`
- Và nhiều thành phần khác...

### NestJS TypeORM Exports

```typescript
export * from '@nestjs/typeorm';
```

Bao gồm:

- `TypeOrmModule`
- `InjectRepository`
- `getRepositoryToken`
- `EntityClassOrSchema` type

## Utility Functions

:::warning
**Deprecated**: Các utility functions này đã bị deprecated. Sử dụng `OrmModule.forRoot` hoặc `TypeOrmModule.forRoot` trực tiếp để có tính năng tốt hơn.
:::

### createTypeOrmRootModule

Tạo root TypeORM module với cấu hình đã cho.

```typescript
import { createTypeOrmRootModule } from '@ecom-co/orm';

const rootModule = createTypeOrmRootModule({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, Product],
});
```

**Parameters:**

| Parameter | Type                   | Description              |
| --------- | ---------------------- | ------------------------ |
| `options` | `TypeOrmModuleOptions` | Cấu hình cho root module |

**Returns:** `DynamicModule` - Module đã được cấu hình

### createTypeOrmFeatureModule

Tạo feature TypeORM module với các entities đã cho.

```typescript
import { createTypeOrmFeatureModule } from '@ecom-co/orm';

const featureModule = createTypeOrmFeatureModule([User, Product]);
```

**Parameters:**

| Parameter  | Type                    | Description                  |
| ---------- | ----------------------- | ---------------------------- |
| `entities` | `EntityClassOrSchema[]` | Mảng các entities để đăng ký |

**Returns:** `DynamicModule` - Module đã được cấu hình

## Sử dụng trong NestJS

### Import Core Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@ecom-co/orm'; // Từ core module

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
```

### Sử dụng TypeORM Decorators

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from '@ecom-co/orm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;
}
```

### Inject Repository

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@ecom-co/orm';
import { Repository } from '@ecom-co/orm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}
}
```

## Migration từ Utility Functions

Thay vì sử dụng các utility functions đã deprecated, hãy sử dụng:

### Thay thế createTypeOrmRootModule

```typescript
// ❌ Deprecated
import { createTypeOrmRootModule } from '@ecom-co/orm';
const module = createTypeOrmRootModule(options);

// ✅ Recommended
import { OrmModule } from '@ecom-co/orm';
const module = OrmModule.forRoot(options);

// Hoặc sử dụng trực tiếp
import { TypeOrmModule } from '@nestjs/typeorm';
const module = TypeOrmModule.forRoot(options);
```

### Thay thế createTypeOrmFeatureModule

```typescript
// ❌ Deprecated
import { createTypeOrmFeatureModule } from '@ecom-co/orm';
const module = createTypeOrmFeatureModule(entities);

// ✅ Recommended
import { OrmModule } from '@ecom-co/orm';
const module = OrmModule.forFeature(entities);

// Hoặc sử dụng trực tiếp
import { TypeOrmModule } from '@nestjs/typeorm';
const module = TypeOrmModule.forFeature(entities);
```

## Ví dụ hoàn chỉnh

```typescript
import { Module } from '@nestjs/common';
import { OrmModule } from '@ecom-co/orm';
import { User, Product } from '@ecom-co/orm';

@Module({
    imports: [
        // Root configuration
        OrmModule.forRoot({
            type: 'postgres',
            url: process.env.DATABASE_URL,
            entities: [User, Product],
            health: true,
        }),

        // Feature modules
        OrmModule.forFeature([User]),
        OrmModule.forFeature([Product]),
    ],
})
export class AppModule {}
```

## Lưu ý quan trọng

:::tip
**Best Practice**: Luôn sử dụng `OrmModule` thay vì các utility functions để có được tất cả tính năng nâng cao như health check và extended repositories.
:::

:::warning
**Deprecation Notice**: Các utility functions sẽ bị loại bỏ trong phiên bản tương lai. Hãy migrate sang sử dụng `OrmModule` hoặc `TypeOrmModule` trực tiếp.
:::

:::info
**Type Safety**: Core module cung cấp đầy đủ type definitions từ TypeORM và NestJS TypeORM, đảm bảo type safety trong toàn bộ ứng dụng.
:::
