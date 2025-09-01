---
id: transformers
title: Transformers — Value Transformers cho TypeORM
sidebar_label: Transformers
slug: /transformers
description: Transformers module cung cấp các value transformers để chuyển đổi dữ liệu giữa JavaScript và database, bao gồm BooleanTransformer và NumericTransformer.
tags: [transformers, value-transformers, boolean, numeric, typeorm, database]
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/Tabs';

:::info
Transformers module cung cấp các value transformers để chuyển đổi dữ liệu giữa JavaScript và database, đặc biệt hữu ích cho các trường hợp cần xử lý boolean và numeric values với null handling.
:::

## Tổng quan

Transformers module bao gồm:

- **BooleanTransformer** - Chuyển đổi boolean ↔ integer (0/1)
- **NumericTransformer** - Xử lý numeric values với validation
- **ValueTransformer interface** - Tuân thủ TypeORM ValueTransformer
- **Null handling** - Xử lý null/undefined values an toàn

## BooleanTransformer

`BooleanTransformer` chuyển đổi boolean values giữa JavaScript boolean và database integer representation.

### Use Cases

| Use Case                   | Mô tả                                | Ví dụ                    |
| -------------------------- | ------------------------------------ | ------------------------ |
| **Database compatibility** | Databases không hỗ trợ boolean type  | MySQL, SQLite            |
| **Legacy systems**         | Hệ thống cũ sử dụng 0/1              | Legacy applications      |
| **Performance**            | Integer operations nhanh hơn boolean | High-performance queries |

### Implementation

```typescript
export class BooleanTransformer implements ValueTransformer {
    from(value: unknown): boolean | null;
    to(value?: boolean | null): 0 | 1 | null | undefined;
}
```

### from() Method

Chuyển đổi database value thành JavaScript boolean.

```typescript
from(value: unknown): boolean | null
```

#### Input Values

| Input       | Output  | Mô tả                 |
| ----------- | ------- | --------------------- |
| `1`         | `true`  | Integer 1 = true      |
| `0`         | `false` | Integer 0 = false     |
| `true`      | `true`  | Boolean true = true   |
| `false`     | `false` | Boolean false = false |
| `'1'`       | `true`  | String '1' = true     |
| `'0'`       | `false` | String '0' = false    |
| `null`      | `null`  | Null = null           |
| `undefined` | `null`  | Undefined = null      |

#### Ví dụ sử dụng

```typescript
const transformer = new BooleanTransformer();

transformer.from(1); // true
transformer.from(0); // false
transformer.from('1'); // true
transformer.from('0'); // false
transformer.from(true); // true
transformer.from(false); // false
transformer.from(null); // null
transformer.from('abc'); // false (không phải 1, true, '1')
```

### to() Method

Chuyển đổi JavaScript boolean thành database value.

```typescript
to(value?: boolean | null): 0 | 1 | null | undefined
```

#### Output Values

| Input       | Output      | Mô tả                     |
| ----------- | ----------- | ------------------------- |
| `true`      | `1`         | Boolean true → Integer 1  |
| `false`     | `0`         | Boolean false → Integer 0 |
| `null`      | `null`      | Null → Null               |
| `undefined` | `undefined` | Undefined → Undefined     |

#### Ví dụ sử dụng

```typescript
const transformer = new BooleanTransformer();

transformer.to(true); // 1
transformer.to(false); // 0
transformer.to(null); // null
transformer.to(undefined); // undefined
```

### Sử dụng trong Entity

```typescript
import { Entity, Column } from 'typeorm';
import { BooleanTransformer } from '@ecom-co/orm';
import { OrmBaseEntity } from '@ecom-co/orm';

@Entity('users')
export class User extends OrmBaseEntity {
    @Column({
        type: 'int',
        transformer: new BooleanTransformer(),
        comment: 'User active status stored as integer',
    })
    isActive!: boolean;

    @Column({
        type: 'int',
        transformer: new BooleanTransformer(),
        default: 1, // true
    })
    isVerified!: boolean;
}
```

## NumericTransformer

`NumericTransformer` xử lý numeric values với proper null handling và validation.

### Use Cases

| Use Case            | Mô tả                                   | Ví dụ                     |
| ------------------- | --------------------------------------- | ------------------------- |
| **Data validation** | Kiểm tra và xử lý invalid numeric data  | User input validation     |
| **Null handling**   | Xử lý null/undefined values an toàn     | Optional numeric fields   |
| **Type conversion** | Chuyển đổi string numbers thành numbers | CSV import, API responses |

### Implementation

```typescript
export class NumericTransformer implements ValueTransformer {
    from(value: unknown): null | number;
    to(value?: null | number): null | number | undefined;
}
```

### from() Method

Chuyển đổi database value thành JavaScript number.

```typescript
from(value: unknown): null | number
```

#### Input Values

| Input       | Output   | Mô tả                     |
| ----------- | -------- | ------------------------- |
| `'123.45'`  | `123.45` | String number → Number    |
| `123.45`    | `123.45` | Number → Number           |
| `'0'`       | `0`      | String zero → Number zero |
| `null`      | `null`   | Null → Null               |
| `undefined` | `null`   | Undefined → Null          |
| `'invalid'` | `null`   | Invalid string → Null     |
| `NaN`       | `null`   | NaN → Null                |

#### Ví dụ sử dụng

```typescript
const transformer = new NumericTransformer();

transformer.from('123.45'); // 123.45
transformer.from(123.45); // 123.45
transformer.from('0'); // 0
transformer.from(0); // 0
transformer.from(null); // null
transformer.from('abc'); // null (invalid)
transformer.from(''); // null (empty string)
```

### to() Method

Chuyển đổi JavaScript number thành database value.

```typescript
to(value?: null | number): null | number | undefined
```

#### Output Values

| Input       | Output      | Mô tả                 |
| ----------- | ----------- | --------------------- |
| `123.45`    | `123.45`    | Number → Number       |
| `0`         | `0`         | Zero → Zero           |
| `null`      | `null`      | Null → Null           |
| `undefined` | `undefined` | Undefined → Undefined |

#### Ví dụ sử dụng

```typescript
const transformer = new NumericTransformer();

transformer.to(123.45); // 123.45
transformer.to(0); // 0
transformer.to(null); // null
transformer.to(undefined); // undefined
```

### Sử dụng trong Entity

```typescript
import { Entity, Column } from 'typeorm';
import { NumericTransformer } from '@ecom-co/orm';
import { OrmBaseEntity } from '@ecom-co/orm';

@Entity('products')
export class Product extends OrmBaseEntity {
    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        transformer: new NumericTransformer(),
        comment: 'Product price with validation',
    })
    price!: number;

    @Column({
        type: 'decimal',
        precision: 5,
        scale: 2,
        transformer: new NumericTransformer(),
        nullable: true,
        comment: 'Optional discount percentage',
    })
    discountPercentage?: number | null;
}
```

## Tạo Custom Transformers

### Extending ValueTransformer

```typescript
import { ValueTransformer } from 'typeorm';

export class CustomTransformer implements ValueTransformer {
    from(value: unknown): any {
        // Logic chuyển đổi từ database
        return value;
    }

    to(value?: any): any {
        // Logic chuyển đổi sang database
        return value;
    }
}
```

### Ví dụ: DateTransformer

```typescript
export class DateTransformer implements ValueTransformer {
    from(value: unknown): Date | null {
        if (value == null) return null;

        try {
            return new Date(value as string | number);
        } catch {
            return null;
        }
    }

    to(value?: Date | null): string | null | undefined {
        if (value == null) return value;

        return value.toISOString();
    }
}
```

### Ví dụ: JSONTransformer

```typescript
export class JSONTransformer implements ValueTransformer {
    from(value: unknown): any {
        if (value == null) return null;

        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
            return null;
        }
    }

    to(value?: any): string | null | undefined {
        if (value == null) return value;

        try {
            return JSON.stringify(value);
        } catch {
            return null;
        }
    }
}
```

## Sử dụng trong Migration

### Tạo Table với Transformers

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP WITH TIME ZONE,
        "email" character varying(255) NOT NULL,
        "isActive" integer NOT NULL DEFAULT 1,
        "score" decimal(5,2),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "users"');
    }
}
```

### Lưu ý Migration

:::warning
**Migration Compatibility**: Khi sử dụng transformers, đảm bảo migration tạo đúng column types mà transformers mong đợi.
:::

## Best Practices

:::tip
**Use for Legacy Systems**: BooleanTransformer đặc biệt hữu ích khi làm việc với legacy databases sử dụng 0/1.
:::

:::tip
**Null Handling**: Luôn xử lý null/undefined values trong transformers để tránh runtime errors.
:::

:::tip
**Validation**: Sử dụng NumericTransformer để validate và clean user input data.
:::

:::warning
**Performance**: Transformers được gọi cho mỗi field, tránh logic phức tạp trong transformers.
:::

:::info
**Type Safety**: Transformers giúp maintain type safety khi làm việc với databases có type system khác JavaScript.
:::

## Ví dụ hoàn chỉnh

### User Entity với Transformers

```typescript
import { Entity, Column, OneToMany } from 'typeorm';
import { BooleanTransformer, NumericTransformer } from '@ecom-co/orm';
import { OrmBaseEntity } from '@ecom-co/orm';
import { Product } from './product.entity';

@Entity('users')
export class User extends OrmBaseEntity {
    @Column({
        type: 'varchar',
        length: 255,
        unique: true,
    })
    email!: string;

    @Column({
        type: 'int',
        transformer: new BooleanTransformer(),
        default: 1,
        comment: 'User active status (1=active, 0=inactive)',
    })
    isActive!: boolean;

    @Column({
        type: 'decimal',
        precision: 5,
        scale: 2,
        transformer: new NumericTransformer(),
        nullable: true,
        comment: 'User rating score (0.00-100.00)',
    })
    rating?: number | null;

    @Column({
        type: 'int',
        transformer: new BooleanTransformer(),
        default: 0,
        comment: 'Email verification status (1=verified, 0=unverified)',
    })
    isEmailVerified!: boolean;

    @OneToMany(() => Product, (product) => product.user)
    products?: Product[];
}
```

### Product Entity với Transformers

```typescript
import { Entity, Column, ManyToOne } from 'typeorm';
import { NumericTransformer, BooleanTransformer } from '@ecom-co/orm';
import { OrmBaseEntity } from '@ecom-co/orm';
import { User } from './user.entity';

@Entity('products')
export class Product extends OrmBaseEntity {
    @Column({
        type: 'varchar',
        length: 255,
    })
    name!: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        transformer: new NumericTransformer(),
        comment: 'Product price',
    })
    price!: number;

    @Column({
        type: 'int',
        transformer: new BooleanTransformer(),
        default: 1,
        comment: 'Product availability (1=available, 0=unavailable)',
    })
    isAvailable!: boolean;

    @Column({
        type: 'decimal',
        precision: 3,
        scale: 2,
        transformer: new NumericTransformer(),
        nullable: true,
        comment: 'Discount percentage (0.00-1.00)',
    })
    discount?: number | null;

    @ManyToOne(() => User, (user) => user.products)
    user!: User;
}
```

### Sử dụng trong Service

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Product } from '@ecom-co/orm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ) {}

    async createUser(email: string, rating?: number): Promise<User> {
        const user = this.userRepo.create({
            email,
            rating, // NumericTransformer sẽ xử lý validation
            isActive: true, // BooleanTransformer sẽ chuyển thành 1
            isEmailVerified: false, // BooleanTransformer sẽ chuyển thành 0
        });

        return this.userRepo.save(user);
    }

    async updateUserStatus(id: string, isActive: boolean): Promise<User> {
        // BooleanTransformer sẽ chuyển boolean thành 0/1
        return this.userRepo.save({ id, isActive });
    }
}
```
