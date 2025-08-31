---
title: Services
description: Tìm hiểu về Services - chứa business logic và xử lý dữ liệu trong NestJS
---

# Services

Services là các providers chứa business logic và xử lý dữ liệu của ứng dụng. Chúng được inject vào controllers và các services khác thông qua Dependency Injection system của NestJS.

## Services là gì?

Services trong NestJS:
- **Business Logic** - chứa logic nghiệp vụ chính của ứng dụng
- **Data Processing** - xử lý và biến đổi dữ liệu
- **External API Calls** - gọi API bên ngoài
- **Database Operations** - thao tác với cơ sở dữ liệu
- **Providers** - được quản lý bởi NestJS DI container

## Tạo Service cơ bản

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly users = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' },
  ];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find(user => user.id === id);
  }
}
```

## Injectable Services

### Decorator @Injectable()

```typescript
@Injectable()
export class UserService {
  // Service logic here
}
```

**Vai trò:**
- Đánh dấu class là provider có thể inject
- Được quản lý bởi NestJS DI container
- Có thể inject vào controllers hoặc services khác
- Hỗ trợ singleton pattern mặc định

### Constructor Injection

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}
}
```

## Service Methods

### CRUD Operations

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  // Read
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Update
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  // Delete
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
```

### Data Validation

```typescript
@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validate email format
    if (!this.isValidEmail(createUserDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });
    
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Validate business rules
    await this.validateBusinessRules(createUserDto);

    return await this.userRepository.save(createUserDto);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async validateBusinessRules(createUserDto: CreateUserDto): Promise<void> {
    // Business validation logic
    if (createUserDto.age < 18) {
      throw new BadRequestException('User must be at least 18 years old');
    }
  }
}
```

### Error Handling

```typescript
@Injectable()
export class UserService {
  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`Error finding user ${id}:`, error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }
}
```

### Logging

```typescript
@Injectable()
export class UserService {
  constructor(private readonly logger: Logger) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);
    
    try {
      const user = await this.userRepository.save(createUserDto);
      this.logger.log(`User created successfully with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

## External API Calls

```typescript
@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async fetchUserFromExternalAPI(userId: string): Promise<any> {
    const apiUrl = this.configService.get('EXTERNAL_API_URL');
    
    try {
      const response = await this.httpService
        .get(`${apiUrl}/users/${userId}`)
        .toPromise();
      
      return response.data;
    } catch (error) {
      this.logger.error(`External API error: ${error.message}`);
      throw new ServiceUnavailableException('External API is not available');
    }
  }

  async syncUserData(userId: string): Promise<void> {
    const externalData = await this.fetchUserFromExternalAPI(userId);
    await this.updateUserFromExternalData(userId, externalData);
  }
}
```

## Database Operations

```typescript
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findUsersWithPosts(): Promise<User[]> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.posts', 'post')
      .where('post.isPublished = :isPublished', { isPublished: true })
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }

  async findUsersByRole(role: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { role },
      order: { createdAt: 'DESC' },
      relations: ['profile', 'settings'],
    });
  }

  async updateUserStatus(id: number, status: string): Promise<User> {
    await this.userRepository.update(id, { status });
    return await this.findOne(id);
  }

  async findUsersByCriteria(criteria: UserSearchCriteria): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (criteria.name) {
      queryBuilder.andWhere('user.name LIKE :name', { name: `%${criteria.name}%` });
    }

    if (criteria.email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${criteria.email}%` });
    }

    if (criteria.role) {
      queryBuilder.andWhere('user.role = :role', { role: criteria.role });
    }

    return await queryBuilder.getMany();
  }
}
```

## Service Composition

```typescript
@Injectable()
export class OrderService {
  constructor(
    private readonly userService: UserService,
    private readonly productService: ProductService,
    private readonly emailService: EmailService,
    private readonly paymentService: PaymentService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    // Validate user
    const user = await this.userService.findOne(createOrderDto.userId);
    
    // Validate products
    const products = await Promise.all(
      createOrderDto.productIds.map(id => this.productService.findOne(id))
    );
    
    // Calculate total
    const total = this.calculateTotal(products);
    
    // Process payment
    const payment = await this.paymentService.processPayment({
      amount: total,
      userId: user.id,
      paymentMethod: createOrderDto.paymentMethod,
    });
    
    // Create order
    const order = await this.orderRepository.save({
      user,
      products,
      total,
      paymentId: payment.id,
      status: 'pending',
    });
    
    // Send confirmation email
    await this.emailService.sendOrderConfirmation(user.email, order);
    
    return order;
  }

  private calculateTotal(products: Product[]): number {
    return products.reduce((sum, product) => sum + product.price, 0);
  }
}
```

## Async/Await Pattern

```typescript
@Injectable()
export class UserService {
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }
}
```

## Service Lifecycle

```typescript
@Injectable()
export class UserService implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly logger: Logger) {}

  onModuleInit() {
    this.logger.log('UserService initialized');
  }

  onModuleDestroy() {
    this.logger.log('UserService destroyed');
  }
}
```

## Best Practices

### 1. Single Responsibility
```typescript
// ✅ Tốt - Mỗi service có một trách nhiệm
@Injectable()
export class UserService {
  // Chỉ xử lý user-related logic
}

@Injectable()
export class EmailService {
  // Chỉ xử lý email-related logic
}

@Injectable()
export class PaymentService {
  // Chỉ xử lý payment-related logic
}

// ❌ Không tốt - Service làm quá nhiều việc
@Injectable()
export class UserService {
  // Xử lý user, email, payment, notification...
}
```

### 2. Error Handling
```typescript
@Injectable()
export class UserService {
  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User ${id} not found`);
      }
      return user;
    } catch (error) {
      this.logger.error(`Error finding user ${id}:`, error);
      throw error;
    }
  }
}
```

### 3. Validation
```typescript
@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validate input
    await this.validateUserData(createUserDto);
    
    // Check business rules
    await this.checkBusinessRules(createUserDto);
    
    // Create user
    return await this.userRepository.save(createUserDto);
  }

  private async validateUserData(createUserDto: CreateUserDto): Promise<void> {
    // Validation logic
  }

  private async checkBusinessRules(createUserDto: CreateUserDto): Promise<void> {
    // Business rules logic
  }
}
```

### 4. Logging
```typescript
@Injectable()
export class UserService {
  constructor(private readonly logger: Logger) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${createUserDto.email}`);
    
    const user = await this.userRepository.save(createUserDto);
    
    this.logger.log(`User created: ${user.id}`);
    return user;
  }
}
```

### 5. Testing
```typescript
@Injectable()
export class UserService {
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

// Test
describe('UserService', () => {
  it('should find user by id', async () => {
    const user = await userService.findOne(1);
    expect(user).toBeDefined();
    expect(user.id).toBe(1);
  });

  it('should throw NotFoundException for non-existent user', async () => {
    await expect(userService.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
```

---

:::tip Lời khuyên
- Services nên chứa business logic, không phải HTTP logic
- Sử dụng async/await cho database operations
- Xử lý lỗi một cách thống nhất
- Log các hoạt động quan trọng
- Viết test cho mọi service method
- Sử dụng dependency injection để giảm coupling
:::

**Bài trước:** [Controllers](/docs/overview/controllers)

**Bài tiếp theo:** [Providers](/docs/overview/providers)
