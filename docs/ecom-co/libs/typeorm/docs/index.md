---
id: lib-typeorm
title: Lib TypeORM — Thư viện ORM cho E-commerce Platform
sidebar_label: Lib TypeORM
slug: /lib-typeorm
description: Thư viện TypeORM được thiết kế đặc biệt cho e-commerce platform, cung cấp base entities, extended repositories, transformers và NestJS integration với health check capabilities.
tags: [typeorm, nestjs, postgresql, ecommerce, database, orm, entities, migrations]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

:::info
Lib TypeORM là một thư viện wrapper cho TypeORM được thiết kế đặc biệt cho e-commerce platform, cung cấp các tính năng nâng cao như base entities, extended repositories, transformers và NestJS integration với health check capabilities.
:::

## Tổng quan

Lib TypeORM là một thư viện persistence layer được xây dựng trên nền tảng TypeORM, cung cấp:

- **Base Entities** với audit trail và lifecycle management
- **Extended Repositories** với các method tiện ích
- **Value Transformers** cho boolean và numeric fields
- **NestJS Integration** với health check capabilities
- **Migration & Seeding** system
- **Standalone Data Source** cho scripts và CLI tools

## Cài đặt

### Yêu cầu hệ thống

- Node.js >= 18.0.0
- PostgreSQL >= 12.0
- TypeScript >= 5.0

### Cài đặt package

```bash
npm install @ecom-co/orm
```

### Dependencies

```bash
npm install @nestjs/typeorm typeorm reflect-metadata pg
npm install -D @types/node typescript
```

## Cấu trúc thư viện

```mermaid
graph TD
    A[Lib TypeORM] --> B[Core Module]
    A --> C[Entities]
    A --> D[Repository]
    A --> E[Transformers]
    A --> F[ORM Module]
    A --> G[Data Source]
    A --> H[Migrations & Seeds]

    B --> B1[TypeORM Exports]
    B --> B2[Utility Functions]

    C --> C1[Base Entity]
    C --> C2[User Entity]
    C --> C3[Product Entity]

    D --> D1[Base Repository]
    D --> D2[Extended Methods]

    E --> E1[Boolean Transformer]
    E --> E2[Numeric Transformer]

    F --> F1[NestJS Integration]
    F --> F2[Health Check]

    G --> G1[Standalone Connection]
    G --> G2[Connection Caching]

    H --> H1[Migration System]
    H --> H2[Seed System]
```

## Quick Start

### 1. Cấu hình cơ bản

```typescript
import { OrmModule } from '@ecom-co/orm';

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

### 2. Sử dụng trong Feature Module

```typescript
import { OrmModule } from '@ecom-co/orm';

@Module({
    imports: [
        OrmModule.forFeatureExtended([User, Product]), // Sử dụng extended repository
    ],
})
export class UserModule {}
```

### 3. Inject Repository

```typescript
import { BaseRepository } from '@ecom-co/orm';
import { User } from '@ecom-co/orm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: BaseRepository<User>,
    ) {}

    async findOrCreate(email: string): Promise<User> {
        return this.userRepo.findOneOrCreate({ email }, { isActive: true });
    }
}
```

## Tính năng chính

### ✅ Base Entity với Audit Trail

- UUID primary keys
- Timestamps tự động (createdAt, updatedAt, deletedAt)
- Soft delete support
- Lifecycle management
- Audit information methods

### ✅ Extended Repository

- `findOneAndUpdate` với upsert option
- `findOneOrCreate` với default values
- Tương thích với TypeORM Repository

### ✅ Value Transformers

- Boolean to Integer conversion
- Numeric validation và null handling
- Tùy chỉnh dễ dàng

### ✅ NestJS Integration

- Health check capabilities
- Global module support
- Async configuration
- Multiple data source support

### ✅ Migration & Seeding

- TypeORM migration system
- Seed data management
- Database versioning

## Cấu hình Environment

Tạo file `.env` với các biến môi trường:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Environment
NODE_ENV=development

# Optional: Custom database settings
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=username
DB_PASSWORD=password
DB_DATABASE=database_name
```

## Scripts có sẵn

Thư viện cung cấp các scripts npm để quản lý database:

```bash
# Generate migration
npm run typeorm:generate -- src/migrations/MigrationName

# Run migrations
npm run typeorm:run

# Revert last migration
npm run typeorm:revert

# Create new migration
npm run typeorm:create -- src/migrations/MigrationName

# Run seeds
npm run seed

# Build library
npm run build

# Publish package
npm run release:patch
npm run release:minor
npm run release:major
```

## Hỗ trợ và Đóng góp

- **Repository**: [GitHub Repository](https://github.com/e-commerce-platform-co/lib-orm.git)
- **Package**: [NPM Package](https://npm.pkg.github.com)
- **License**: MIT

:::tip
Để bắt đầu nhanh chóng, hãy xem các ví dụ trong thư mục `examples/` và documentation chi tiết cho từng module.
:::

:::warning
Đảm bảo bạn đã cài đặt và cấu hình PostgreSQL trước khi sử dụng thư viện này.
:::
