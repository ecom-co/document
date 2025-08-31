---
title: Overview - Các thành phần cơ bản của NestJS
description: Tìm hiểu về các thành phần cơ bản và kiến trúc của NestJS framework
---

# Overview - Các thành phần cơ bản của NestJS

Sau khi cài đặt thành công, bạn cần hiểu các thành phần cơ bản của NestJS để bắt đầu phát triển ứng dụng. Đây là những khái niệm quan trọng nhất mà bạn cần nắm vững.

## Kiến trúc tổng quan

NestJS được xây dựng dựa trên kiến trúc module, sử dụng Dependency Injection và các decorators để tạo ra ứng dụng có cấu trúc rõ ràng và dễ bảo trì.

:::tip Kiến trúc chính
NestJS tổ chức ứng dụng thành các **Modules**, mỗi module chứa **Controllers**, **Services** và **Providers** được kết nối thông qua **Dependency Injection**.
:::

## 1. Modules (Mô-đun)

Modules là cách NestJS tổ chức ứng dụng thành các phần riêng biệt và có thể tái sử dụng.

### AppModule (Module gốc)
- Module chính của ứng dụng
- Import tất cả các modules khác
- Cấu hình global providers

### Feature Modules
- Mỗi tính năng có một module riêng
- Ví dụ: UserModule, ProductModule, OrderModule
- Chứa controllers, services liên quan đến tính năng đó

### Shared Modules
- Chia sẻ logic giữa các modules
- Export providers để modules khác sử dụng
- Ví dụ: DatabaseModule, AuthModule

### Global Modules
- Có thể sử dụng ở mọi nơi trong ứng dụng
- Không cần import vào từng module
- Ví dụ: ConfigModule, LoggerModule

**Ví dụ cấu trúc:**
```
AppModule
├── UserModule
├── ProductModule
├── OrderModule
└── AuthModule
```

## 2. Controllers (Bộ điều khiển)

Controllers xử lý các HTTP requests và định nghĩa routes cho ứng dụng.

### Vai trò của Controllers
- **Nhận requests** từ client (browser, mobile app, etc.)
- **Validate dữ liệu** đầu vào
- **Gọi services** để xử lý logic
- **Trả về response** cho client

### HTTP Methods
- `@Get()` - lấy dữ liệu (GET request)
- `@Post()` - tạo mới (POST request)
- `@Put()` - cập nhật toàn bộ (PUT request)
- `@Patch()` - cập nhật một phần (PATCH request)
- `@Delete()` - xóa (DELETE request)

### Route Parameters
- **Path Parameters** - `/users/:id`
- **Query Parameters** - `/users?page=1&limit=10`
- **Request Body** - dữ liệu gửi trong body
- **Headers** - thông tin bổ sung

## 3. Services (Dịch vụ)

Services chứa business logic và xử lý dữ liệu của ứng dụng.

### Vai trò của Services
- **Business Logic** - logic nghiệp vụ chính
- **Data Processing** - xử lý và biến đổi dữ liệu
- **External API Calls** - gọi API bên ngoài
- **Database Operations** - thao tác với cơ sở dữ liệu

### Injectable Services
- Được đánh dấu bằng `@Injectable()`
- Có thể inject vào controllers hoặc services khác
- Quản lý lifecycle bởi NestJS DI container

### Service Methods
- **CRUD Operations** - Create, Read, Update, Delete
- **Data Validation** - kiểm tra dữ liệu
- **Error Handling** - xử lý lỗi
- **Logging** - ghi log

## 4. Providers (Nhà cung cấp)

Providers cung cấp dependencies cho ứng dụng thông qua Dependency Injection.

### Các loại Providers
- **Services** - business logic
- **Repositories** - truy cập database
- **Factories** - tạo objects
- **Values** - constants, configuration
- **Custom Providers** - providers tùy chỉnh

### Provider Registration
- Đăng ký trong module's `providers` array
- Có thể export để modules khác sử dụng
- Có thể set scope (DEFAULT, REQUEST, TRANSIENT)

## 5. Dependency Injection (DI)

NestJS sử dụng DI để tự động kết nối các thành phần với nhau.

### Lợi ích của DI
- **Automatic Wiring** - tự động kết nối dependencies
- **Loose Coupling** - giảm sự phụ thuộc giữa các components
- **Easy Testing** - dễ dàng mock dependencies
- **Reusability** - tái sử dụng logic

### Constructor Injection
```typescript
constructor(private userService: UserService) {}
```

### Property Injection
```typescript
@Inject('CONFIG') private config: ConfigService;
```

## 6. Decorators (Trang trí)

Decorators định nghĩa metadata cho classes và methods.

### Class Decorators
- `@Controller()` - định nghĩa controller
- `@Injectable()` - định nghĩa service
- `@Module()` - định nghĩa module
- `@Global()` - định nghĩa global module

### Method Decorators
- `@Get()`, `@Post()`, `@Put()`, `@Delete()` - HTTP methods
- `@UseGuards()` - áp dụng guards
- `@UseInterceptors()` - áp dụng interceptors
- `@UsePipes()` - áp dụng pipes

### Parameter Decorators
- `@Body()` - request body
- `@Param()` - path parameters
- `@Query()` - query parameters
- `@Headers()` - request headers

## 7. Guards (Bảo vệ)

Guards bảo vệ routes và xử lý authentication/authorization.

### Vai trò của Guards
- **Authentication** - xác thực người dùng
- **Authorization** - phân quyền truy cập
- **Route Protection** - bảo vệ các endpoints
- **Pre-request Processing** - xử lý trước khi vào controller

### Built-in Guards
- **AuthGuard** - xác thực JWT
- **RolesGuard** - kiểm tra roles
- **ThrottlerGuard** - giới hạn request rate

### Custom Guards
- Tạo guard tùy chỉnh
- Implement `CanActivate` interface
- Logic xác thực/phân quyền

## 8. Interceptors (Can thiệp)

Interceptors can thiệp vào request/response lifecycle.

### Vai trò của Interceptors
- **Request Transformation** - biến đổi request
- **Response Transformation** - biến đổi response
- **Logging** - ghi log
- **Error Handling** - xử lý lỗi
- **Caching** - cache response

### Built-in Interceptors
- **LoggingInterceptor** - ghi log requests
- **CacheInterceptor** - cache responses
- **TimeoutInterceptor** - timeout requests

### Interceptor Lifecycle
1. **Pre-processing** - trước khi vào controller
2. **Post-processing** - sau khi controller xử lý xong
3. **Exception handling** - xử lý lỗi

## 9. Pipes (Ống dẫn)

Pipes xử lý và validate dữ liệu trước khi vào controller.

### Vai trò của Pipes
- **Validation** - kiểm tra dữ liệu đầu vào
- **Transformation** - biến đổi dữ liệu
- **Type Conversion** - chuyển đổi kiểu dữ liệu
- **Default Values** - giá trị mặc định

### Built-in Pipes
- **ValidationPipe** - validate DTOs
- **ParseIntPipe** - chuyển string thành number
- **ParseBoolPipe** - chuyển string thành boolean
- **ParseArrayPipe** - chuyển string thành array

### Custom Pipes
- Tạo pipe tùy chỉnh
- Implement `PipeTransform` interface
- Logic validation/transformation

## 10. Exception Filters (Bộ lọc ngoại lệ)

Exception filters xử lý lỗi một cách thống nhất.

### Vai trò của Exception Filters
- **Error Handling** - xử lý lỗi tập trung
- **Custom Error Responses** - tùy chỉnh response lỗi
- **Logging** - ghi log lỗi
- **Error Formatting** - định dạng lỗi

### Built-in Exceptions
- **BadRequestException** - 400 Bad Request
- **UnauthorizedException** - 401 Unauthorized
- **NotFoundException** - 404 Not Found
- **InternalServerErrorException** - 500 Internal Server Error

### Custom Exception Filters
- Tạo filter tùy chỉnh
- Implement `ExceptionFilter` interface
- Logic xử lý lỗi cụ thể

## Luồng xử lý request cơ bản

```
Client Request
    ↓
Middleware (nếu có)
    ↓
Guards (Authentication/Authorization)
    ↓
Interceptors (Pre-processing)
    ↓
Pipes (Validation/Transformation)
    ↓
Controller (Route Handler)
    ↓
Service (Business Logic)
    ↓
Database/External APIs
    ↓
Service (Process Response)
    ↓
Controller (Format Response)
    ↓
Interceptors (Post-processing)
    ↓
Client Response
```

## Best Practices

### 1. Separation of Concerns
- Tách biệt rõ ràng các layer
- Controllers chỉ xử lý HTTP, Services xử lý business logic
- Mỗi module có trách nhiệm riêng biệt

### 2. Single Responsibility
- Mỗi class chỉ có một trách nhiệm
- Services nhỏ, tập trung vào một domain
- Controllers đơn giản, chỉ routing

### 3. Dependency Injection
- Sử dụng DI thay vì tạo objects trực tiếp
- Inject dependencies qua constructor
- Tránh circular dependencies

### 4. Error Handling
- Xử lý lỗi một cách thống nhất
- Sử dụng exception filters
- Log lỗi đầy đủ

### 5. Validation
- Validate dữ liệu đầu vào
- Sử dụng DTOs và validation pipes
- Kiểm tra type safety

### 6. Testing
- Viết test cho mọi component
- Unit tests cho services
- Integration tests cho controllers
- E2E tests cho toàn bộ flow

---

:::info Tiếp theo
Bây giờ bạn đã hiểu các thành phần cơ bản, hãy bắt đầu tạo ứng dụng đầu tiên!
:::
