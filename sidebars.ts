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
            'ecom-co/libs/grpc/grpc-library',
            'ecom-co/libs/rabbitmq/rabbitmq-library',
            'ecom-co/libs/redis/redis-library',
            'ecom-co/libs/typeorm/typeorm-library',
            'ecom-co/libs/elasticsearch/elasticsearch-library',
            'ecom-co/libs/utils/utils-library',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
