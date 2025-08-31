---
id: typeorm-library
title: TypeORM Library
sidebar_label: TypeORM Library
---

# TypeORM Library

:::tip 💡 Khái niệm cơ bản
TypeORM Library cung cấp các utilities để implement database operations với TypeORM.
:::

## TypeORM Library là gì?

**Lý thuyết cơ bản:**
TypeORM Library là một thư viện được thiết kế đặc biệt để simplify quá trình implement TypeORM trong NestJS applications.

**Đặc điểm kỹ thuật:**
- **Repository Pattern**: Implement repository pattern
- **Query Builder**: Simplify query building
- **Migrations**: Manage database migrations
- **Connection Management**: Manage database connections

## Kiến trúc TypeORM Library

```mermaid
flowchart TD
    A[TypeORM Library] -->|1. Connection| B[Database]
    
    A -->|2. Repository Manager| C[Repository Manager]
    A -->|3. Query Builder| D[Query Builder]
    A -->|4. Migration Manager| E[Migration Manager]
    
    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style C fill:#f3e5f5
    style D fill:#fff3e0
    style E fill:#fce4ec
```

## Cách sử dụng

### **1. Installation**

```bash
npm install @ecom-co/typeorm
```

### **2. Basic Usage**

---

**Bài tiếp theo:** [Elasticsearch Library](/docs/ecom-co/libs/elasticsearch/elasticsearch-library)
