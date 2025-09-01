---
id: migrations-seeding
title: Migrations & Seeding — Database Versioning và Data Population
sidebar_label: Migrations & Seeding
slug: /migrations-seeding
description: Migration và Seeding system cung cấp database versioning, schema management và data population cho development, testing và production environments.
tags: [migrations, seeding, database, versioning, schema, data-population]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/Tabs';

:::info
Migration và Seeding system cung cấp database versioning, schema management và data population cho development, testing và production environments với TypeORM integration.
:::

## Tổng quan

Migration và Seeding system bao gồm:

- **Migration System** - Database schema versioning và management
- **Seeding System** - Data population cho development và testing
- **TypeORM Integration** - Sử dụng TypeORM migration tools
- **CLI Scripts** - NPM scripts để quản lý database
- **Environment Support** - Hỗ trợ nhiều môi trường khác nhau

## Migration System

### Tổng quan Migration

Migration là cách để quản lý database schema changes theo thời gian, đảm bảo:

- **Version Control** - Theo dõi thay đổi database schema
- **Team Collaboration** - Đồng bộ schema giữa các developers
- **Environment Consistency** - Đảm bảo schema giống nhau giữa các môi trường
- **Rollback Support** - Có thể revert về version cũ nếu cần

### Migration Files

#### Cấu trúc Migration

```typescript
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitDb1754759157275 implements MigrationInterface {
    name = 'InitDb1754759157275';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Logic để apply migration
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Logic để revert migration
    }
}
```

#### Migration Interface

| Method   | Mô tả            | Khi nào được gọi     |
| -------- | ---------------- | -------------------- |
| `up()`   | Apply migration  | Khi chạy migration   |
| `down()` | Revert migration | Khi revert migration |

#### Ví dụ Migration

```typescript
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1754759157275 implements MigrationInterface {
    name = 'CreateUsersTable1754759157275';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "email" character varying(255) NOT NULL,
        "firstName" character varying(100),
        "lastName" character varying(100),
        "isActive" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "users"');
    }
}
```

### Migration Commands

#### Generate Migration

Tạo migration mới dựa trên thay đổi entities:

```bash
npm run typeorm:generate -- src/migrations/MigrationName
```

**Ví dụ:**

```bash
npm run typeorm:generate -- src/migrations/AddUserProfile
```

**Kết quả:**

- Tạo file migration mới trong `src/migrations/`
- Tự động detect thay đổi từ entities
- Tạo `up()` và `down()` methods

#### Create Migration

Tạo migration file trống để viết SQL thủ công:

```bash
npm run typeorm:create -- src/migrations/MigrationName
```

**Ví dụ:**

```bash
npm run typeorm:create -- src/migrations/CustomSQLMigration
```

**Kết quả:**

- Tạo file migration trống
- Cần viết logic `up()` và `down()` thủ công
- Phù hợp cho complex SQL operations

#### Run Migrations

Chạy tất cả pending migrations:

```bash
npm run typeorm:run
```

**Quá trình:**

1. Kết nối database
2. Kiểm tra migrations table
3. Chạy các migrations chưa được apply
4. Cập nhật migrations table

#### Revert Migration

Revert migration cuối cùng:

```bash
npm run typeorm:revert
```

**Quá trình:**

1. Kết nối database
2. Tìm migration cuối cùng đã apply
3. Chạy method `down()` của migration đó
4. Xóa record khỏi migrations table

### Migration Configuration

#### Data Source Configuration

```typescript
// src/orm/data-source.ts
const dataSource = new DataSource({
    type: 'postgres',
    entities: CORE_ENTITIES,
    migrations: ['src/migrations/*.{ts,js}'], // Migration files pattern
    migrationsTableName: 'migrations', // Tên table lưu migration history
    url: databaseUrl,
});
```

#### Migration Table

TypeORM tự động tạo table `migrations` với cấu trúc:

```sql
CREATE TABLE "migrations" (
  "id" SERIAL PRIMARY KEY,
  "timestamp" bigint NOT NULL,
  "name" character varying NOT NULL
);
```

### Migration Best Practices

#### 1. Naming Convention

```typescript
// ✅ Good naming
export class CreateUsersTable1754759157275 implements MigrationInterface
export class AddUserProfileFields1754759200000 implements MigrationInterface
export class UpdateProductPricing1754759250000 implements MigrationInterface

// ❌ Bad naming
export class Migration1754759157275 implements MigrationInterface
export class Update1754759200000 implements MigrationInterface
```

#### 2. Atomic Changes

```typescript
// ✅ Good: Mỗi migration chỉ thay đổi một thing
export class AddUserEmailField1754759157275 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "email" character varying(255) NOT NULL
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "email"
    `);
    }
}

// ❌ Bad: Quá nhiều thay đổi trong một migration
export class BigMigration1754759157275 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 10+ table changes...
    }
}
```

#### 3. Proper Rollback

```typescript
// ✅ Good: down() method đúng đắn
public async down(queryRunner: QueryRunner): Promise<void> {
  // Revert chính xác những gì up() đã làm
  await queryRunner.query('DROP TABLE "users"');
}

// ❌ Bad: down() method không đúng
public async down(queryRunner: QueryRunner): Promise<void> {
  // Không revert đúng những gì up() đã làm
  await queryRunner.query('DROP TABLE "products"');
}
```

## Seeding System

### Tổng quan Seeding

Seeding là quá trình populate database với initial data:

- **Development Data** - Sample data để test features
- **Test Data** - Data để run automated tests
- **Production Data** - Initial data cần thiết cho production

### Seed Configuration

#### Seed Entry Point

```typescript
// src/orm/seed.ts
import 'reflect-metadata';
import { runSeeds } from '../seeds';
import dataSource from './data-source';

const main = async (): Promise<void> => {
    const ds = await dataSource.initialize();

    try {
        await runSeeds(ds);
    } finally {
        if (ds.isInitialized) await ds.destroy();
    }
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
```

#### Seed Function

```typescript
// src/seeds/index.ts
import type { DataSource } from 'typeorm';

export const runSeeds = async (ds: DataSource): Promise<void> => {
    // Add your seed functions here
    // const userRepo = ds.getRepository(User);
    // await userRepo.save(userRepo.create({ name: 'admin', isActive: true }));
};
```

### Running Seeds

#### Command Line

```bash
npm run seed
```

**Quá trình:**

1. Kết nối database
2. Chạy tất cả seed functions
3. Đóng kết nối database

#### Programmatic Usage

```typescript
import { runSeeds } from '@ecom-co/orm/seeds';
import dataSource from '@ecom-co/orm/orm/data-source';

async function seedDatabase() {
    const ds = await dataSource.initialize();

    try {
        await runSeeds(ds);
        console.log('Seeding completed');
    } finally {
        if (ds.isInitialized) {
            await ds.destroy();
        }
    }
}
```

### Seed Implementation Examples

#### 1. Basic User Seeding

```typescript
// src/seeds/user.seed.ts
import type { DataSource } from 'typeorm';
import { User } from '@ecom-co/orm';

export const seedUsers = async (ds: DataSource): Promise<void> => {
    const userRepo = ds.getRepository(User);

    // Check if users already exist
    const existingUsers = await userRepo.count();
    if (existingUsers > 0) {
        console.log('Users already seeded, skipping...');
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

    // Create test users
    const testUsers = [
        {
            email: 'user1@example.com',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
        },
        {
            email: 'user2@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            isActive: true,
        },
    ];

    await userRepo.save(testUsers.map((user) => userRepo.create(user)));

    console.log(`Seeded ${testUsers.length + 1} users`);
};
```

#### 2. Product Seeding với Relationships

```typescript
// src/seeds/product.seed.ts
import type { DataSource } from 'typeorm';
import { User, Product } from '@ecom-co/orm';

export const seedProducts = async (ds: DataSource): Promise<void> => {
    const userRepo = ds.getRepository(User);
    const productRepo = ds.getRepository(Product);

    // Get admin user
    const adminUser = await userRepo.findOne({
        where: { email: 'admin@example.com' },
    });

    if (!adminUser) {
        console.log('Admin user not found, skipping product seeding...');
        return;
    }

    // Check if products already exist
    const existingProducts = await productRepo.count();
    if (existingProducts > 0) {
        console.log('Products already seeded, skipping...');
        return;
    }

    // Create sample products
    const products = [
        {
            name: 'Sample Product 1',
            description: 'First sample product for testing',
            isActive: true,
            userId: adminUser.id,
        },
        {
            name: 'Sample Product 2',
            description: 'Second sample product for testing',
            isActive: true,
            userId: adminUser.id,
        },
        {
            name: 'Inactive Product',
            description: 'This product is inactive',
            isActive: false,
            userId: adminUser.id,
        },
    ];

    await productRepo.save(products.map((product) => productRepo.create(product)));

    console.log(`Seeded ${products.length} products`);
};
```

#### 3. Main Seed Function

```typescript
// src/seeds/index.ts
import type { DataSource } from 'typeorm';
import { seedUsers } from './user.seed';
import { seedProducts } from './product.seed';

export const runSeeds = async (ds: DataSource): Promise<void> => {
    console.log('Starting database seeding...');

    try {
        // Seed users first (required for products)
        await seedUsers(ds);

        // Seed products (depends on users)
        await seedProducts(ds);

        console.log('Database seeding completed successfully');
    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    }
};
```

### Environment-specific Seeding

#### Development Seeding

```typescript
// src/seeds/development.seed.ts
export const seedDevelopmentData = async (ds: DataSource): Promise<void> => {
    if (process.env.NODE_ENV !== 'development') {
        return; // Chỉ chạy trong development
    }

    // Development-specific data
    await seedUsers(ds);
    await seedProducts(ds);
    await seedTestData(ds);
};
```

#### Test Seeding

```typescript
// src/seeds/test.seed.ts
export const seedTestData = async (ds: DataSource): Promise<void> => {
    if (process.env.NODE_ENV !== 'test') {
        return; // Chỉ chạy trong test
    }

    // Test-specific data
    await seedTestUsers(ds);
    await seedTestProducts(ds);
};
```

## CLI Scripts

### Available Scripts

| Script                 | Command                    | Mô tả                           |
| ---------------------- | -------------------------- | ------------------------------- |
| **Generate Migration** | `npm run typeorm:generate` | Tạo migration từ entity changes |
| **Create Migration**   | `npm run typeorm:create`   | Tạo migration file trống        |
| **Run Migrations**     | `npm run typeorm:run`      | Chạy pending migrations         |
| **Revert Migration**   | `npm run typeorm:revert`   | Revert migration cuối cùng      |
| **Seed Database**      | `npm run seed`             | Chạy seeding scripts            |

### Script Configuration

```json
// package.json
{
    "scripts": {
        "typeorm:generate": "typeorm-ts-node-commonjs migration:generate -d src/orm/data-source.ts",
        "posttypeorm:generate": "npm run lint:fix",
        "typeorm:create": "typeorm-ts-node-commonjs migration:create",
        "typeorm:run": "typeorm-ts-node-commonjs migration:run -d src/orm/data-source.ts",
        "typeorm:revert": "typeorm-ts-node-commonjs migration:revert -d src/orm/data-source.ts",
        "seed": "ts-node -r dotenv/config src/orm/seed.ts"
    }
}
```

### Script Usage Examples

#### Development Workflow

```bash
# 1. Make changes to entities
# 2. Generate migration
npm run typeorm:generate -- src/migrations/AddUserProfile

# 3. Review generated migration
# 4. Run migration
npm run typeorm:run

# 5. Seed with test data
npm run seed
```

#### Production Deployment

```bash
# 1. Deploy new code
# 2. Run migrations
npm run typeorm:run

# 3. Verify migration status
# 4. Seed production data (if needed)
npm run seed
```

## Best Practices

### Migration Best Practices

:::tip
**Atomic Changes**: Mỗi migration chỉ thay đổi một thing để dễ rollback.
:::

:::tip
**Proper Naming**: Sử dụng tên mô tả rõ ràng cho migration files.
:::

:::tip
**Test Migrations**: Luôn test migrations trong development trước khi deploy production.
:::

:::warning
**Never Modify Applied Migrations**: Không sửa migrations đã được apply trong production.
:::

:::info
**Backup Before Migration**: Luôn backup database trước khi chạy migrations quan trọng.
:::

### Seeding Best Practices

:::tip
**Check Existing Data**: Luôn kiểm tra data đã tồn tại trước khi seed.
:::

:::tip
**Environment Awareness**: Sử dụng environment-specific seeding cho development và testing.
:::

:::tip
**Dependency Order**: Seed data theo thứ tự dependencies (users trước products).
:::

:::warning
**Production Seeding**: Cẩn thận khi seed production data, chỉ seed data cần thiết.
:::

:::info
**Idempotent**: Seeding functions nên idempotent (có thể chạy nhiều lần an toàn).
:::

## Ví dụ hoàn chỉnh

### Migration Workflow

```bash
# 1. Tạo migration từ entity changes
npm run typeorm:generate -- src/migrations/AddUserProfileFields

# 2. Review và edit migration file
# 3. Run migration
npm run typeorm:run

# 4. Verify migration
# 5. Seed test data
npm run seed
```

### Seeding Workflow

```bash
# 1. Edit seed functions
# 2. Run seeding
npm run seed

# 3. Verify seeded data
# 4. Test application with seeded data
```

### CI/CD Integration

```yaml
# .github/workflows/deploy.yml
- name: Run Database Migrations
  run: |
      npm run typeorm:run
      npm run seed

- name: Verify Migration Status
  run: |
      # Verify all migrations applied successfully
```

### Rollback Strategy

```bash
# Nếu migration gây vấn đề
npm run typeorm:revert

# Verify rollback
# Fix migration file
npm run typeorm:run
```
