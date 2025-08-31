---
id: utils-library
title: Utils Library
sidebar_label: Utils Library
---

# Utils Library

:::tip 💡 Khái niệm cơ bản
Utils Library cung cấp các utility functions và helpers cho common operations.
:::

## Utils Library là gì?

**Lý thuyết cơ bản:**
Utils Library là một thư viện được thiết kế đặc biệt để cung cấp các utility functions và helpers cho common operations trong NestJS applications.

**Đặc điểm kỹ thuật:**
- **Common Functions**: Common utility functions
- **String Utils**: String manipulation utilities
- **Date Utils**: Date manipulation utilities
- **Validation Utils**: Validation utilities

## Kiến trúc Utils Library

```mermaid
flowchart TD
    A[Utils Library] -->|1. String Utils| B[String Utils]
    A -->|2. Date Utils| C[Date Utils]
    A -->|3. Validation Utils| D[Validation Utils]
    A -->|4. Common Utils| E[Common Utils]
    
    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style C fill:#f3e5f5
    style D fill:#fff3e0
    style E fill:#fce4ec
```

## Cách sử dụng

### **1. Installation**

```bash
npm install @ecom-co/utils
```

---

**Bài tiếp theo:** [Overview](/docs/ecom-co/ecom-co-overview)
