---
id: repository
title: Repository — Extended Repository và Base Repository
sidebar_label: Repository
slug: /repository
description: Repository module cung cấp BaseRepository với các method tiện ích như findOneAndUpdate, findOneOrCreate và cách tạo custom repository providers.
tags: [repository, base-repository, extended-methods, upsert, find-or-create]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/Tabs';

:::info
Repository module cung cấp BaseRepository mở rộng từ TypeORM Repository với các method tiện ích như findOneAndUpdate với upsert option và findOneOrCreate với default values.
:::

## Tổng quan

Repository module bao gồm:

- **BaseRepository** - Extended repository với các method tiện ích
- **createBaseRepositoryProviders** - Function tạo custom repository providers
- **Enhanced methods** - findOneAndUpdate, findOneOrCreate
- **TypeORM compatibility** - Tương thích hoàn toàn với TypeORM Repository

## BaseRepository

`BaseRepository<Entity>` extends `Repository<Entity>` và cung cấp các method bổ sung:

### Inheritance

```typescript
export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity>
```

### Tính năng chính

| Tính năng                 | Mô tả                                | Lợi ích                    |
| ------------------------- | ------------------------------------ | -------------------------- |
| **findOneAndUpdate**      | Tìm và update entity, hỗ trợ upsert  | Giảm code boilerplate      |
| **findOneOrCreate**       | Tìm entity hoặc tạo mới với defaults | Xử lý logic phức tạp       |
| **TypeORM compatibility** | Tất cả methods từ Repository         | Không cần thay đổi code cũ |

## Hướng dẫn thêm Method mới vào BaseRepository

### 1. Cấu trúc BaseRepository

`BaseRepository` là class mở rộng từ TypeORM `Repository` với các method tiện ích:

```typescript
export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
  // Các method có sẵn
  async findOneAndUpdate(...): Promise<Entity | null>
  async findOneOrCreate(...): Promise<Entity>

  // Thêm method mới ở đây
}
```

### 2. Thêm Method mới

#### Demo: Thêm method `findByStatus`

Đây là ví dụ cụ thể để thêm method mới vào BaseRepository:

```typescript
// src/repository/extend-repository.ts
export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    // ... existing methods ...

    /**
     * Tìm tất cả entities theo status
     * @param status - Status để filter
     * @returns Promise<Entity[]> - Mảng entities
     */
    async findByStatus(status: boolean): Promise<Entity[]> {
        return this.find({
            where: { isActive: status } as FindOptionsWhere<Entity>,
        });
    }
}
```

#### Demo: Thêm method `findWithPagination`

Method phức tạp hơn với pagination và metadata:

```typescript
export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
    /**
     * Tìm entities theo custom criteria với pagination
     * @param criteria - Custom criteria
     * @param page - Trang hiện tại
     * @param limit - Số lượng items mỗi trang
     * @returns Promise<{ data: Entity[], total: number, page: number, limit: number }>
     */
    async findWithPagination(
        criteria: FindOptionsWhere<Entity>,
        page: number = 1,
        limit: number = 10,
    ): Promise<{
        data: Entity[];
        total: number;
        page: number;
        limit: number;
    }> {
        const [data, total] = await this.findAndCount({
            where: criteria,
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' } as FindOptionsOrder<Entity>,
        });

        return { data, total, page, limit };
    }
}
```

#### Các loại Method thường gặp

**Filter Methods**: Tìm entities theo criteria cụ thể

- `findByStatus()`: Filter theo boolean field
- `findByDateRange()`: Filter theo range date
- `findByField()`: Filter theo field bất kỳ

**Bulk Operations**: Xử lý nhiều entities cùng lúc

- `bulkUpdate()`: Update nhiều entities
- `bulkSoftDelete()`: Soft delete nhiều entities
- `bulkRestore()`: Restore nhiều entities

**Utility Methods**: Các method tiện ích

- `findWithPagination()`: Pagination với metadata
- `searchByText()`: Text search trên nhiều fields
- `findByIdWithRelations()`: Load entity với relationships

### 3. Method với Generic Types

#### Lý thuyết về Generic Methods

**Pagination Method**: Xử lý phân trang với metadata

- Sử dụng `FindOptionsWhere<Entity>` để type-safe criteria
- Return object chứa data, total, page, limit
- Sử dụng `findAndCount()` để lấy cả data và tổng số

**Search Method**: Text search trên nhiều fields

- Sử dụng `keyof Entity` để type-safe field names
- Tạo dynamic where conditions với `Like` operator
- Hỗ trợ search trên nhiều fields cùng lúc

**Type Safety**: Đảm bảo type safety với generic Entity

- `FindOptionsWhere<Entity>`: Type-safe where conditions
- `FindOptionsOrder<Entity>`: Type-safe ordering
- `QueryDeepPartialEntity<Entity>`: Type-safe update data

### 4. Method với Relationships

#### Lý thuyết về Relationship Methods

**findByIdWithRelations**: Load entity với relationships cụ thể

- Sử dụng `relations` array để chỉ định relationships cần load
- Tránh N+1 query problem bằng cách load relationships cùng lúc
- Hỗ trợ eager loading cho performance optimization

**findAllWithRelations**: Load tất cả entities với relationships

- Sử dụng `relations` để load relationships cho collection
- Kết hợp với ordering để sắp xếp kết quả
- Hữu ích cho các trường hợp cần hiển thị data với related entities

**Performance Considerations**:

- Chỉ load relationships cần thiết
- Sử dụng `select` để limit fields được load
- Cân nhắc giữa eager loading và lazy loading

### 5. Method với Transactions

#### Lý thuyết về Transaction Methods

**createWithTransaction**: Tạo entity trong transaction context

- Sử dụng `queryRunner.manager` thay vì repository methods
- Đảm bảo operation được thực hiện trong transaction scope
- Hỗ trợ rollback nếu có lỗi xảy ra

**updateWithTransaction**: Update entity trong transaction context

- Sử dụng `queryRunner.manager.update()` để update
- Sau đó fetch lại entity để return data mới nhất
- Đảm bảo consistency trong transaction

**Transaction Benefits**:

- **Atomicity**: Tất cả operations thành công hoặc fail cùng lúc
- **Consistency**: Database state luôn consistent
- **Isolation**: Transactions không ảnh hưởng lẫn nhau
- **Durability**: Changes được persist sau khi commit

### 6. Build và Test

Sau khi thêm method mới:

```bash
# Build library
npm run build

# Run linting
npm run lint

# Test build
npm run test

# Verify TypeScript compilation
npx tsc --noEmit
```

### 7. Sử dụng Method mới

```typescript
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: BaseRepository<User>,
    ) {}

    // Sử dụng method mới
    async getActiveUsers(): Promise<User[]> {
        return this.userRepo.findByStatus(true);
    }

    async getUsersByDateRange(start: Date, end: Date): Promise<User[]> {
        return this.userRepo.findByDateRange(start, end);
    }

    async getUsersWithPagination(page: number, limit: number): Promise<any> {
        return this.userRepo.findWithPagination({}, page, limit);
    }
}
```

## Cách hoạt động của BaseRepository

### createBaseRepositoryProviders

Function này tạo custom repository providers cho phép inject `BaseRepository<Entity>` thay vì `Repository<Entity>`:

```typescript
export const createBaseRepositoryProviders = (entities: EntityClassOrSchema[]): Provider[] =>
    entities.map((entity) => ({
        inject: [DataSource],
        provide: getRepositoryToken(entity),
        useFactory: (dataSource: DataSource) => {
            const repo = dataSource.getRepository(entity as EntityTarget<ObjectLiteral>);

            // Mix BaseRepository methods vào standard repository
            Object.setPrototypeOf(repo, BaseRepository.prototype);

            return repo;
        },
    }));
```

### Cách hoạt động

1. **Lấy standard repository** từ DataSource
2. **Mix BaseRepository methods** vào standard repository
3. **Override repository token** để inject BaseRepository
4. **Tự động có tất cả methods** từ cả Repository và BaseRepository

## Sử dụng BaseRepository trong NestJS

### 1. Cách đơn giản nhất - Sử dụng OrmModule.forFeatureExtended

```typescript
import { OrmModule } from '@ecom-co/orm';

@Module({
    imports: [
        OrmModule.forFeatureExtended([User, Product]), // Tự động tạo BaseRepository providers
    ],
})
export class UserModule {}
```

### 2. Inject và sử dụng BaseRepository

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '@ecom-co/orm';
import { User } from '@ecom-co/orm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: BaseRepository<User>, // Sử dụng BaseRepository thay vì Repository
    ) {}

    // Sử dụng method có sẵn
    async findOrCreateUser(email: string): Promise<User> {
        return this.userRepo.findOneOrCreate({ email }, { isActive: true });
    }

    // Sử dụng method mới đã thêm
    async getActiveUsers(): Promise<User[]> {
        return this.userRepo.findByStatus(true);
    }

    async getUsersByDateRange(start: Date, end: Date): Promise<User[]> {
        return this.userRepo.findByDateRange(start, end);
    }
}
```

### 3. Tạo providers thủ công (nếu cần)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createBaseRepositoryProviders } from '@ecom-co/orm';
import { User, Product } from '@ecom-co/orm';

@Module({
    imports: [TypeOrmModule.forFeature([User, Product])],
    providers: [
        ...createBaseRepositoryProviders([User, Product]), // Tạo BaseRepository providers
    ],
})
export class CustomModule {}
```

## Sử dụng BaseRepository trong thực tế

### 1. Các loại Service thường gặp

**Basic Service**: Sử dụng methods có sẵn

- `findOneOrCreate()`: Tìm hoặc tạo entity mới
- `findOneAndUpdate()`: Tìm và update entity
- `findByStatus()`: Filter theo status

**Advanced Service**: Sử dụng methods mới đã thêm

- `findByDateRange()`: Filter theo range date
- `findWithPagination()`: Pagination với metadata
- `searchByText()`: Text search trên nhiều fields
- `bulkSoftDelete()`: Bulk operations

**Transactional Service**: Sử dụng transaction methods

- `createWithTransaction()`: Tạo entity trong transaction
- `updateWithTransaction()`: Update entity trong transaction
- Đảm bảo data consistency

### 2. Best Practices khi sử dụng

- **Type Safety**: Luôn khai báo `BaseRepository<Entity>`
- **Method Selection**: Chọn method phù hợp với use case
- **Error Handling**: Xử lý lỗi phù hợp cho từng method
- **Performance**: Sử dụng bulk operations cho large datasets

## Best Practices khi sử dụng BaseRepository

:::tip
**Sử dụng OrmModule.forFeatureExtended**: Đây là cách đơn giản nhất để có BaseRepository tự động.
:::

:::tip
**Type Safety**: Luôn khai báo type `BaseRepository<Entity>` để có được type safety và IntelliSense.
:::

:::tip
**Method Naming**: Đặt tên method rõ ràng, mô tả chính xác chức năng của method.
:::

:::warning
**Provider Override**: `createBaseRepositoryProviders` override default repository tokens, chỉ sử dụng khi cần thiết.
:::

:::info
**Compatibility**: BaseRepository tương thích hoàn toàn với TypeORM Repository, có thể sử dụng tất cả methods gốc.
:::

## Migration từ Repository cũ

### 1. Thay thế Repository type

```typescript
// ❌ Cũ
@InjectRepository(User)
private userRepo: Repository<User>;

// ✅ Mới
@InjectRepository(User)
private userRepo: BaseRepository<User>;
```

### 2. Thay thế logic phức tạp

```typescript
// ❌ Logic cũ - phức tạp
async findOrCreateUser(email: string): Promise<User> {
  let user = await this.userRepo.findOne({ where: { email } });
  if (!user) {
    user = this.userRepo.create({ email, isActive: true });
    await this.userRepo.save(user);
  }
  return user;
}

// ✅ Sử dụng BaseRepository - đơn giản
async findOrCreateUser(email: string): Promise<User> {
  return this.userRepo.findOneOrCreate(
    { email },
    { isActive: true }
  );
}
```

### 3. Thay thế bulk operations

```typescript
// ❌ Logic cũ - nhiều queries
async deactivateUsers(userIds: string[]): Promise<void> {
  for (const id of userIds) {
    await this.userRepo.update(id, { isActive: false });
  }
}

// ✅ Sử dụng BaseRepository - một query
async deactivateUsers(userIds: string[]): Promise<void> {
  await this.userRepo.bulkUpdate(userIds, { isActive: false });
}
```

## Troubleshooting

### Lỗi thường gặp

1. **Type Error**: `Property 'findByStatus' does not exist on type 'Repository<User>'`
    - **Nguyên nhân**: Chưa inject BaseRepository
    - **Giải pháp**: Sử dụng `OrmModule.forFeatureExtended()` hoặc `createBaseRepositoryProviders()`

2. **Method không hoạt động**: Method mới không được nhận diện
    - **Nguyên nhân**: Chưa build lại library
    - **Giải pháp**: Chạy `npm run build` sau khi thêm method mới

3. **Circular Dependency**: Lỗi circular dependency khi sử dụng BaseRepository
    - **Nguyên nhân**: Import/export không đúng
    - **Giải pháp**: Kiểm tra lại cấu trúc import/export trong entities

### 4. Lỗi TypeScript compilation

```typescript
// ❌ Lỗi: Type 'Repository<User>' is not assignable to type 'BaseRepository<User>'
@InjectRepository(User)
private userRepo: BaseRepository<User>;

// ✅ Giải pháp: Sử dụng OrmModule.forFeatureExtended
@Module({
  imports: [
    OrmModule.forFeatureExtended([User]), // Tự động tạo BaseRepository
  ],
})
export class UserModule {}
```

## Tóm tắt

BaseRepository cung cấp các method tiện ích mở rộng từ TypeORM Repository:

- **findOneAndUpdate**: Tìm và update entity, hỗ trợ upsert
- **findOneOrCreate**: Tìm entity hoặc tạo mới với defaults
- **findByStatus**: Filter entities theo status
- **findByDateRange**: Filter entities theo range date
- **bulkUpdate**: Update nhiều entities cùng lúc
- **bulkSoftDelete**: Soft delete nhiều entities
- **findWithPagination**: Pagination với metadata
- **searchByText**: Text search trên nhiều fields
- **findByIdWithRelations**: Load entity với relationships
- **createWithTransaction**: Tạo entity với transaction
- **updateWithTransaction**: Update entity với transaction

Để sử dụng BaseRepository, chỉ cần:

1. Sử dụng `OrmModule.forFeatureExtended([Entity])`
2. Inject với type `BaseRepository<Entity>`
3. Sử dụng các method tiện ích
