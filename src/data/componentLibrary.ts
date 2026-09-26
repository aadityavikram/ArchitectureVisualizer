import type { LibraryItem, NodeType } from '@/types/architecture';

export const componentLibrary: LibraryItem[] = [
  { type: 'client', name: 'Client', description: 'End-user application client', category: 'clients' },
  { type: 'web-browser', name: 'Web Browser', description: 'Browser-based client', category: 'clients' },
  { type: 'mobile-app', name: 'Mobile App', description: 'Native or hybrid mobile client', category: 'clients' },
  { type: 'internet', name: 'Internet', description: 'Public internet edge', category: 'networking' },
  { type: 'dns', name: 'DNS', description: 'Domain name resolution', category: 'networking' },
  { type: 'cdn', name: 'CDN', description: 'Content delivery network', category: 'networking' },
  { type: 'load-balancer', name: 'Load Balancer', description: 'Distributes traffic across targets', category: 'networking' },
  { type: 'api-gateway', name: 'API Gateway', description: 'Central API entry point', category: 'networking' },
  { type: 'ingress', name: 'Ingress', description: 'Kubernetes ingress controller', category: 'networking' },
  { type: 'web-server', name: 'Web Server', description: 'Serves static and dynamic web content', category: 'compute' },
  { type: 'application-server', name: 'Application Server', description: 'Hosts business application logic', category: 'compute' },
  { type: 'microservice', name: 'Microservice', description: 'Independent deployable service', category: 'compute' },
  { type: 'worker', name: 'Worker', description: 'Background job processor', category: 'compute' },
  { type: 'database', name: 'Database', description: 'Persistent relational or document store', category: 'databases' },
  { type: 'search-engine', name: 'Search Engine', description: 'Full-text search index', category: 'databases' },
  { type: 'cache', name: 'Cache', description: 'In-memory cache layer', category: 'caching' },
  { type: 'message-queue', name: 'Message Queue', description: 'Async message broker', category: 'messaging' },
  { type: 'kafka', name: 'Kafka', description: 'Distributed event streaming', category: 'messaging' },
  { type: 'object-storage', name: 'Object Storage', description: 'Blob and object storage', category: 'storage' },
  { type: 'auth-service', name: 'Authentication Service', description: 'Identity and access management', category: 'security' },
  { type: 'monitoring', name: 'Monitoring', description: 'Metrics and observability', category: 'observability' },
  { type: 'logging', name: 'Logging', description: 'Centralized log aggregation', category: 'observability' },
  { type: 'external-api', name: 'External API', description: 'Third-party external service', category: 'external' },
  { type: 'custom', name: 'Custom Component', description: 'User-defined architecture component', category: 'compute' },
];

export const categoryLabels: Record<string, string> = {
  clients: 'Clients',
  networking: 'Networking',
  compute: 'Compute',
  databases: 'Databases',
  caching: 'Caching',
  messaging: 'Messaging',
  storage: 'Storage',
  security: 'Security',
  observability: 'Observability',
  external: 'External Services',
};

export const categoryOrder = [
  'clients',
  'networking',
  'compute',
  'databases',
  'caching',
  'messaging',
  'storage',
  'security',
  'observability',
  'external',
] as const;

export function getDefaultNodeName(type: NodeType): string {
  const item = componentLibrary.find((c) => c.type === type);
  return item?.name ?? 'Component';
}

export function getLibraryItem(type: NodeType): LibraryItem | undefined {
  return componentLibrary.find((c) => c.type === type);
}
