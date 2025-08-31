---
id: elasticsearch-library
title: Elasticsearch Library
sidebar_label: Elasticsearch Library
---

# Elasticsearch Library

:::tip 💡 Khái niệm cơ bản
Elasticsearch Library cung cấp các utilities để implement search và analytics với Elasticsearch.
:::

## Elasticsearch Library là gì?

**Lý thuyết cơ bản:**
Elasticsearch Library là một thư viện được thiết kế đặc biệt để simplify quá trình implement Elasticsearch trong NestJS applications.

**Đặc điểm kỹ thuật:**
- **Search Operations**: Implement search operations
- **Index Management**: Manage Elasticsearch indices
- **Query Builder**: Simplify query building
- **Aggregations**: Support aggregations

## Kiến trúc Elasticsearch Library

```mermaid
flowchart TD
    A[Elasticsearch Library] -->|1. Connection| B[Elasticsearch]
    
    A -->|2. Search Manager| C[Search Manager]
    A -->|3. Index Manager| D[Index Manager]
    A -->|4. Query Builder| E[Query Builder]
    
    style A fill:#e3f2fd
    style B fill:#e8f5e8
    style C fill:#f3e5f5
    style D fill:#fff3e0
    style E fill:#fce4ec
```

## Cách sử dụng

### **1. Installation**

```bash
npm install @ecom-co/elasticsearch
```

### **2. Basic Usage**


---

**Bài tiếp theo:** [Utils Library](/docs/ecom-co/libs/utils/utils-library)
