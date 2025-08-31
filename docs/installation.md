---
title: Cài đặt NestJS
description: Hướng dẫn cài đặt và thiết lập NestJS trên máy tính của bạn
---

# Cài đặt NestJS

Trước khi bắt đầu với NestJS, bạn cần cài đặt các công cụ cần thiết và tạo project đầu tiên. Hướng dẫn này sẽ giúp bạn thiết lập môi trường phát triển NestJS một cách dễ dàng.

## Yêu cầu hệ thống

### Node.js
NestJS yêu cầu Node.js phiên bản 18.0.0 trở lên. Để kiểm tra phiên bản hiện tại:

```bash
node --version
```

Nếu chưa cài đặt hoặc phiên bản cũ, hãy tải về từ [nodejs.org](https://nodejs.org).

### npm, yarn hoặc pnpm
NestJS CLI hoạt động với cả npm, yarn và pnpm:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="npm" label="npm" default>

```bash
npm --version
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn --version
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm --version
```

</TabItem>
</Tabs>

## Cài đặt NestJS CLI

NestJS CLI là công cụ chính để tạo và quản lý project. Cài đặt toàn cục:

<Tabs>
<TabItem value="npm" label="npm" default>

```bash
npm install -g @nestjs/cli
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn global add @nestjs/cli
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm add -g @nestjs/cli
```

</TabItem>
</Tabs>

Sau khi cài đặt, kiểm tra phiên bản:

```bash
nest --version
```

## Tạo project đầu tiên

### Lệnh tạo project mới
Sử dụng lệnh sau để tạo project NestJS mới:

```bash
nest new my-nest-app
```

**Giải thích từng phần:**
- **`nest`** - NestJS CLI command
- **`new`** - tạo project mới
- **`my-nest-app`** - tên project (có thể thay đổi)

### Các options khi tạo project

#### Chọn package manager
Khi chạy lệnh, CLI sẽ hỏi bạn chọn package manager:

```
? Which package manager would you ❤️  to use? (Use arrow keys)
❯ npm
  yarn
  pnpm
```

- **npm** - package manager mặc định, ổn định
- **yarn** - package manager nhanh hơn, có lock file
- **pnpm** - package manager tiết kiệm dung lượng

#### Tên project
Bạn có thể đặt tên project theo ý muốn:

```bash
# Ví dụ các tên project
nest new user-management-api
nest new ecommerce-backend
nest new blog-api
nest new my-awesome-app
```

**Lưu ý về tên project:**
- Sử dụng kebab-case (dấu gạch ngang)
- Không dùng dấu cách hoặc ký tự đặc biệt
- Nên mô tả chức năng của ứng dụng

#### Các options khác
NestJS CLI cũng hỗ trợ các options khác:

```bash
# Tạo project với TypeScript strict mode
nest new my-app --strict

# Tạo project với package manager cụ thể
nest new my-app --package-manager yarn

# Tạo project với Git repository
nest new my-app --git

# Tạo project với tất cả options
nest new my-app --strict --package-manager pnpm --git
```

### Quá trình tạo project
Khi chạy `nest new`, CLI sẽ thực hiện các bước:

1. **Tạo thư mục project** - tạo folder với tên bạn chọn
2. **Khởi tạo Git repository** - nếu chọn option --git
3. **Tạo cấu trúc file** - tạo các file và thư mục cần thiết
4. **Cài đặt dependencies** - cài đặt các package cần thiết
5. **Tạo file cấu hình** - tsconfig.json, nest-cli.json, etc.
6. **Tạo code mẫu** - app.controller.ts, app.service.ts, app.module.ts

### Cấu trúc project
Sau khi tạo xong, project sẽ có cấu trúc như sau:

```
my-nest-app/
├── src/
│   ├── app.controller.ts      # Controller chính
│   ├── app.service.ts         # Service chính
│   ├── app.module.ts          # Module gốc
│   └── main.ts               # Entry point
├── test/                     # Thư mục test
│   ├── app.e2e-spec.ts       # End-to-end tests
│   └── jest-e2e.json         # Cấu hình Jest cho E2E
├── package.json              # Dependencies và scripts
├── tsconfig.json             # Cấu hình TypeScript
├── nest-cli.json             # Cấu hình NestJS CLI
├── .eslintrc.js              # Cấu hình ESLint
├── .prettierrc               # Cấu hình Prettier
└── README.md                 # Tài liệu project
```

**Giải thích các file quan trọng:**
- **`main.ts`** - điểm khởi đầu của ứng dụng
- **`app.module.ts`** - module gốc, import tất cả modules khác
- **`app.controller.ts`** - xử lý HTTP requests
- **`app.service.ts`** - chứa business logic
- **`package.json`** - quản lý dependencies và scripts
- **`tsconfig.json`** - cấu hình TypeScript compiler

## Chạy ứng dụng

### Chế độ development
Để chạy ứng dụng ở chế độ development với hot reload:

<Tabs>
<TabItem value="npm" label="npm" default>

```bash
npm run start:dev
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
yarn start:dev
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
pnpm start:dev
```

</TabItem>
</Tabs>

Ứng dụng sẽ chạy tại `http://localhost:3000`

### Các lệnh chạy khác

<Tabs>
<TabItem value="npm" label="npm" default>

- **`npm run start`** - chạy ứng dụng production
- **`npm run start:debug`** - chạy với debug mode
- **`npm run start:prod`** - build và chạy production

</TabItem>
<TabItem value="yarn" label="yarn">

- **`yarn start`** - chạy ứng dụng production
- **`yarn start:debug`** - chạy với debug mode
- **`yarn start:prod`** - build và chạy production

</TabItem>
<TabItem value="pnpm" label="pnpm">

- **`pnpm start`** - chạy ứng dụng production
- **`pnpm start:debug`** - chạy với debug mode
- **`pnpm start:prod`** - build và chạy production

</TabItem>
</Tabs>

## Kiểm tra cài đặt

### Truy cập ứng dụng
Mở trình duyệt và truy cập `http://localhost:3000`. Bạn sẽ thấy thông báo "Hello World!" từ NestJS.

### Kiểm tra API
NestJS tự động tạo một endpoint mẫu. Truy cập `http://localhost:3000` để xem kết quả.

## Cấu hình IDE

### VS Code (Khuyến nghị)
Cài đặt các extension sau để có trải nghiệm tốt nhất:

- **TypeScript Importer** - tự động import
- **ES7+ React/Redux/React-Native snippets** - code snippets
- **Auto Rename Tag** - tự động đổi tên tag
- **Bracket Pair Colorizer** - màu sắc cho brackets

### WebStorm
WebStorm có hỗ trợ tích hợp tốt cho TypeScript và NestJS.

## Troubleshooting

### Lỗi thường gặp

**Port 3000 đã được sử dụng**
```bash
# Thay đổi port trong main.ts
await app.listen(3001);
```

**Lỗi TypeScript**

<Tabs>
<TabItem value="npm" label="npm" default>

```bash
# Cài đặt lại dependencies
rm -rf node_modules
npm install
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
# Cài đặt lại dependencies
rm -rf node_modules
yarn install
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
# Cài đặt lại dependencies
rm -rf node_modules
pnpm install
```

</TabItem>
</Tabs>

**Lỗi permission khi cài đặt global**

<Tabs>
<TabItem value="npm" label="npm" default>

```bash
# Trên macOS/Linux
sudo npm install -g @nestjs/cli

# Hoặc sử dụng nvm
nvm install node
nvm use node
```

</TabItem>
<TabItem value="yarn" label="yarn">

```bash
# Trên macOS/Linux
sudo yarn global add @nestjs/cli

# Hoặc sử dụng nvm
nvm install node
nvm use node
```

</TabItem>
<TabItem value="pnpm" label="pnpm">

```bash
# Trên macOS/Linux
sudo pnpm add -g @nestjs/cli

# Hoặc sử dụng nvm
nvm install node
nvm use node
```

</TabItem>
</Tabs>

## Bước tiếp theo

Sau khi cài đặt thành công, bạn có thể:

1. **Tìm hiểu cấu trúc project** - hiểu các file và thư mục
2. **Tạo controller đầu tiên** - xử lý HTTP requests
3. **Thêm service** - logic nghiệp vụ
4. **Kết nối database** - lưu trữ dữ liệu

---

:::tip Lời khuyên
- Luôn sử dụng phiên bản LTS của Node.js
- Cập nhật NestJS CLI thường xuyên: `npm update -g @nestjs/cli`
- Sử dụng TypeScript strict mode để có type safety tốt nhất
- pnpm giúp tiết kiệm dung lượng ổ đĩa và tăng tốc độ cài đặt
:::

**Bài tiếp theo:** [Tạo ứng dụng Hello World](/docs/basics/03-hello-world)
