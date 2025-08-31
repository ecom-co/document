---
id: redis-library
title: Redis Library
sidebar_label: Redis Library
---

# Redis Library

:::tip 💡 Khái niệm cơ bản
Redis Library cung cấp các utilities để implement caching, session management, và distributed locking với Redis.
:::

## Redis Library là gì?

**Lý thuyết cơ bản:**
Redis Library là một thư viện được thiết kế đặc biệt để simplify quá trình implement Redis trong NestJS applications.

**Đặc điểm kỹ thuật:**
- **Caching**: Implement caching strategies
- **Session Management**: Quản lý user sessions
- **Distributed Locking**: Implement distributed locking
- **Data Structures**: Hỗ trợ Redis data structures

## Kiến trúc Redis Library

```mermaid
flowchart TD
    A[Redis Library] -->|1. Connection| B[Redis Server]
    
    A -->|2. Cache Manager| C[Cache Manager]
    A -->|3. Session Manager| D[Session Manager]
    A -->|4. Lock Manager| E[Lock Manager]
    
    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style C fill:#f3e5f5
    style D fill:#fff3e0
    style E fill:#fce4ec
```

## Cách sử dụng

### **1. Installation**

```bash
npm install @ecom-co/redis
```

### **2. Basic Usage**


**Bài tiếp theo:** [TypeORM Library](/docs/ecom-co/libs/typeorm/typeorm-library)
