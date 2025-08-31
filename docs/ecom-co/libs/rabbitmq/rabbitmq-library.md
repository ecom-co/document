---
id: rabbitmq-library
title: RabbitMQ Library
sidebar_label: RabbitMQ Library
---

# RabbitMQ Library

:::tip 💡 Khái niệm cơ bản
RabbitMQ Library cung cấp các utilities để implement message queuing với RabbitMQ trong NestJS applications.
:::

## RabbitMQ Library là gì?

**Lý thuyết cơ bản:**
RabbitMQ Library là một thư viện được thiết kế đặc biệt để simplify quá trình implement message queuing với RabbitMQ trong NestJS applications.

**Đặc điểm kỹ thuật:**
- **Message Producers**: Tạo message producers
- **Message Consumers**: Implement message consumers
- **Queue Management**: Quản lý queues
- **Exchange Types**: Hỗ trợ các loại exchanges
- **Error Handling**: Built-in error handling
- **Retry Logic**: Retry logic cho failed messages

## Kiến trúc RabbitMQ Library

```mermaid
flowchart TD
    A[RabbitMQ Library] -->|1. Connection| B[RabbitMQ Server]
    
    A -->|2. Create Producer| C[Message Producer]
    A -->|3. Create Consumer| D[Message Consumer]
    
    C -->|4. Publish Messages| E[Queue]
    E -->|5. Consume Messages| D
    
    D -->|6. Process Messages| F[Business Logic]
    F -->|7. Acknowledge| G[Message Acknowledged]
    
    H[Error Handler] --> D
    I[Retry Logic] --> H
    
    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style C fill:#f3e5f5
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f1f8e9
    style G fill:#c8e6c9
    style H fill:#ffcdd2
    style I fill:#fff9c4
```

## Cách sử dụng


**Bài tiếp theo:** [Redis Library](/docs/ecom-co/libs/redis/redis-library)
