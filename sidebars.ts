import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'installation',
    {
      type: 'category',
      label: 'Overview',
      items: [
        'overview/modules',
        'overview/controllers',
        'overview/providers',
        'overview/request-lifecycle',
        'overview/middleware',
        'overview/guards',
        'overview/interceptors',
        'overview/pipes',
        'overview/decorators',
      ],
    },
    {
      type: 'category',
      label: 'Tips & Troubleshooting',
      items: [
        'tips/circular-dependency',
        'tips/memory-leaks',
        'tips/performance-issues',
      ],
    },
    {
      type: 'category',
      label: 'HTTP & Exception Handling',
      items: [
        'http-exception/http-methods',
        'http-exception/exception-filters',
        'http-exception/status-codes',
        'http-exception/error-handling',
      ],
    },
    {
      type: 'category',
      label: 'Microservices & Communication',
      items: [
        'microservices/microservices-overview',
        {
          type: 'category',
          label: 'Communication Protocols',
          items: [
            'microservices/communication/communication-overview',
            'microservices/communication/grpc-protocol',
            'microservices/communication/rest-protocol',
            'microservices/communication/message-queues',
            'microservices/communication/websockets',
            'microservices/communication/event-driven',
          ],
        },
        'microservices/service-discovery',
        'microservices/load-balancing',
        'microservices/microservices-patterns',
        'microservices/microservices-testing',
        'microservices/microservices-deployment',
      ],
    },
    {
      type: 'category',
      label: 'Ecom-co Libraries',
      items: [
        'ecom-co/ecom-co-overview',
        {
          type: 'category',
          label: 'Libraries',
          items: [
            {
              type: 'category',
              label: 'gRPC Library',
              items: [
                'ecom-co/libs/grpc/grpc-library',
                'ecom-co/libs/grpc/docs/proto-utils',
                'ecom-co/libs/grpc/docs/wrapped-grpc',
                'ecom-co/libs/grpc/docs/grpc-validation-pipe',
                'ecom-co/libs/grpc/docs/grpc-server-exception-filter',
                'ecom-co/libs/grpc/docs/grpc-utilities',
                'ecom-co/libs/grpc/docs/grpc-client-exception-filter',
                'ecom-co/libs/grpc/docs/grpc-exceptions',
              ],
            },
            'ecom-co/libs/rabbitmq/rabbitmq-library',
            {
              type: 'category',
              label: 'Redis Library',
              items: [
                'ecom-co/libs/redis/redis-library',
                'ecom-co/libs/redis/docs/redis-overview',
                'ecom-co/libs/redis/docs/redis-installation',
                'ecom-co/libs/redis/docs/redis-examples',
                'ecom-co/libs/redis/docs/redis-facade',
                'ecom-co/libs/redis/docs/redis-api-reference',
              ],
            },
                          {
                type: 'category',
                label: 'TypeORM Library',
                items: [
                  'ecom-co/libs/typeorm/typeorm-library',
                  'ecom-co/libs/typeorm/docs/lib-typeorm',
                  'ecom-co/libs/typeorm/docs/core-module',
                  'ecom-co/libs/typeorm/docs/orm-module',
                  'ecom-co/libs/typeorm/docs/data-source',
                  'ecom-co/libs/typeorm/docs/entities',
                  'ecom-co/libs/typeorm/docs/repository',
                  'ecom-co/libs/typeorm/docs/transformers',
                  'ecom-co/libs/typeorm/docs/migrations-seeding',
                  'ecom-co/libs/typeorm/docs/development-guide',
                ],
              },
            'ecom-co/libs/elasticsearch/elasticsearch-library',
            {
              type: 'category',
              label: 'Utils Library',
              items: [
                'ecom-co/libs/utils/utils-library',
                'ecom-co/libs/utils/docs/validation-config',
                'ecom-co/libs/utils/docs/swagger-config',
                'ecom-co/libs/utils/docs/validate-decorator',
                'ecom-co/libs/utils/docs/http-exception-filter',
                'ecom-co/libs/utils/docs/dto-module',
                'ecom-co/libs/utils/docs/api-endpoint-decorator',
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default sidebars;
