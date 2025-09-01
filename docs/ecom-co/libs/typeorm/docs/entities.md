---
id: entities
title: Entities — Base Entity và Core Entities
sidebar_label: Entities
slug: /entities
description: Entities module cung cấp base entity với audit trail và lifecycle management, cùng với các core entities cho e-commerce platform.
tags: [entities, base-entity, user, product, audit, lifecycle, soft-delete]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/Tabs';

:::info
Entities module cung cấp hệ thống entities hoàn chỉnh với base entity có sẵn audit trail, lifecycle management và soft-delete capabilities, cùng với các core entities cho e-commerce platform.
:::

## Tổng quan

Entities module bao gồm:

- **OrmBaseEntity** - Abstract base class với audit trail và lifecycle management
- **User Entity** - Entity quản lý người dùng với authentication
- **Product Entity** - Entity quản lý sản phẩm
- **CORE_ENTITIES** - Array chứa tất cả core entities để dễ dàng đăng ký

## OrmBaseEntity

`OrmBaseEntity` là abstract base class mà tất cả entities khác phải extend. Nó cung cấp:

### Các trường cơ bản

```typescript
export abstract class OrmBaseEntity extends TypeOrmBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ name: 'deletedAt', type: 'timestamptz', nullable: true })
    deletedAt?: Date | null;
}
```

### Tính năng chính

| Tính năng            | Mô tả                                  | Ví dụ                                        |
| -------------------- | -------------------------------------- | -------------------------------------------- |
| **UUID Primary Key** | Sử dụng UUID thay vì auto-increment    | `id: "550e8400-e29b-41d4-a716-446655440000"` |
| **Timestamps**       | Tự động quản lý createdAt và updatedAt | `createdAt: "2024-01-15T10:30:00Z"`          |
| **Soft Delete**      | Hỗ trợ xóa mềm với deletedAt           | `deletedAt: "2024-01-15T11:00:00Z"`          |
| **Audit Trail**      | Theo dõi toàn bộ lifecycle của entity  | `getAuditInfo()`                             |

### Lifecycle Management

```typescript
// Kiểm tra trạng thái entity
const isNew = entity.isRecent(); // < 24h
const isMature = entity.getLifecycleStage() === 'mature'; // 1-30 ngày
const isOld = entity.isOld(); // > 30 ngày

// Kiểm tra soft delete
const isDeleted = entity.isSoftDeleted;
const canRestore = entity.deletedAt !== null;
```

### Audit Information

```typescript
const auditInfo = entity.getAuditInfo();
// Kết quả:
// {
//   id: "550e8400-e29b-41d4-a716-446655440000",
//   age: "2 days",
//   isOld: false,
//   isRecent: false,
//   isSoftDeleted: false,
//   lifecycleStage: "mature",
//   createdAt: "2024-01-13T10:30:00Z",
//   updatedAt: "2024-01-15T10:30:00Z",
//   deletedAt: null
// }
```

### Utility Methods

| Method                   | Mô tả                              | Returns                   |
| ------------------------ | ---------------------------------- | ------------------------- |
| `getAge()`               | Tuổi entity tính bằng milliseconds | `number`                  |
| `getAgeString()`         | Tuổi entity dạng human-readable    | `string`                  |
| `isValid()`              | Kiểm tra entity có hợp lệ không    | `boolean`                 |
| `clone()`                | Tạo bản sao entity với ID mới      | `this`                    |
| `merge(data)`            | Merge data vào entity              | `this`                    |
| `toPlainObject(fields?)` | Chuyển entity thành plain object   | `Record<string, unknown>` |
| `toPublicObject()`       | Chuyển entity thành public DTO     | `Record<string, unknown>` |

## Hướng dẫn thêm Entity mới

### 1. Tạo Entity Class

Tạo file mới trong thư mục `src/entities/core/` với tên `[entity-name].entity.ts`:

```typescript
// src/entities/core/category.entity.ts
import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { OrmBaseEntity } from '../base.entity';

@Entity({ name: 'categories', comment: 'Product categories' })
export class Category extends OrmBaseEntity {
    @Column({
        type: 'varchar',
        length: 100,
        comment: 'Category name',
    })
    name!: string;

    @Column({
        type: 'text',
        nullable: true,
        comment: 'Category description',
    })
    description?: string;

    @Column({
        type: 'int',
        default: 0,
        comment: 'Display order',
    })
    sortOrder!: number;

    @Column({
        type: 'boolean',
        default: true,
        comment: 'Category visibility',
    })
    isActive!: boolean;

    // Relationships
    @OneToMany(() => Product, (product) => product.category)
    products?: Product[];
}
```

### 2. Cập nhật CORE_ENTITIES

Thêm entity mới vào `src/entities/core/index.ts`:

```typescript
// src/entities/core/index.ts
export * from './category.entity';

import { User } from './user.entity';
import { Product } from './product.entity';
import { Category } from './category.entity';

export const CORE_ENTITIES: EntityClassOrSchema[] = [
    User,
    Product,
    Category, // Thêm Category entity
];
```

### 3. Export từ Main Index

Cập nhật `src/entities/index.ts`:

```typescript
// src/entities/index.ts
export * from './core';
export * from './category.entity'; // Export Category entity
```

### 4. Tạo Migration

```bash
# Generate migration từ entity changes
npm run typeorm:generate -- src/migrations/AddCategoryEntity
```

### 5. Cập nhật Seeds

Tạo file seed mới và cập nhật `runSeeds` function để include entity mới.

**Lưu ý**: Đảm bảo thứ tự seeding phù hợp với dependencies giữa các entities.

### 6. Build và Test

```bash
# Build library
npm run build

# Run migration
npm run typeorm:run

# Test seeding
npm run seed

# Verify build
npm run lint
```

## CORE_ENTITIES

Array chứa tất cả core entities để dễ dàng đăng ký trong TypeORM modules.

```typescript
export const CORE_ENTITIES: EntityClassOrSchema[] = [User, Product];
```

### Sử dụng trong TypeORM Module

```typescript
import { CORE_ENTITIES } from '@ecom-co/orm';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            entities: CORE_ENTITIES, // Sử dụng tất cả core entities
        }),
    ],
})
export class AppModule {}
```

### Sử dụng trong Feature Module

```typescript
import { CORE_ENTITIES } from '@ecom-co/orm';

@Module({
    imports: [
        TypeOrmModule.forFeature(CORE_ENTITIES), // Đăng ký tất cả core entities
    ],
})
export class CoreModule {}
```

## Lý thuyết về Entity

### 1. Cấu trúc Entity

Entity trong TypeORM là class đại diện cho database table. Mỗi entity cần:

- **Decorator `@Entity()`**: Định nghĩa table name và metadata
- **Extend `OrmBaseEntity`**: Kế thừa các tính năng cơ bản
- **Decorator `@Column()`**: Định nghĩa table columns
- **Relationships**: Định nghĩa mối quan hệ với entities khác

### 2. Quy tắc đặt tên

- **Entity class**: PascalCase (ví dụ: `UserProfile`)
- **Table name**: snake_case (ví dụ: `user_profiles`)
- **Column names**: snake_case (ví dụ: `created_at`)
- **File names**: kebab-case (ví dụ: `user-profile.entity.ts`)

### 3. Column Types

- **String**: `varchar`, `text`, `char`
- **Numeric**: `int`, `decimal`, `float`
- **Boolean**: `boolean` hoặc `int` với transformer
- **Date**: `timestamp`, `date`, `timestamptz`
- **JSON**: `json`, `jsonb`

## Best Practices

:::tip
**Extend OrmBaseEntity**: Luôn extend `OrmBaseEntity` để có được audit trail và lifecycle management.
:::

:::tip
**Use meaningful names**: Đặt tên entity và table rõ ràng, có ý nghĩa.
:::

:::tip
**Add comments**: Sử dụng comment để mô tả mục đích của entity và columns.
:::

:::warning
**Password security**: Luôn sử dụng `select: false` cho password fields.
:::

:::info
**Relationships**: Sử dụng eager loading cho các relationships thường xuyên được sử dụng.
:::

## Tổng kết

### Workflow thêm Entity mới

1. **Tạo Entity Class** → Extend OrmBaseEntity, định nghĩa columns và relationships
2. **Cập nhật CORE_ENTITIES** → Thêm entity vào array để tự động đăng ký
3. **Export từ main index** → Để có thể import từ bên ngoài
4. **Tạo Migration** → Generate migration từ entity changes
5. **Cập nhật Seeds** → Thêm logic seeding cho entity mới
6. **Build và Test** → Build library và test migration/seeding

### Lợi ích của OrmBaseEntity

- **Audit Trail**: Tự động quản lý createdAt, updatedAt, deletedAt
- **UUID Primary Keys**: Sử dụng UUID thay vì auto-increment
- **Soft Delete**: Hỗ trợ xóa mềm với deletedAt
- **Lifecycle Management**: Các utility methods để quản lý entity lifecycle
- **Type Safety**: Full TypeScript support với type safety
