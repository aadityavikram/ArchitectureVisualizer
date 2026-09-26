import type { ArchitectureProject } from '@/types/architecture';
import { generateId } from '@/utils/architectureHelpers';
import { systemDesignTemplates } from '@/data/systemDesignTemplates';
import type { TemplateDefinition, TemplateCategory } from '@/data/templateTypes';
import { TemplateBuilder } from '@/data/templateBuilders';

export type { TemplateCategory, TemplateDefinition } from '@/data/templateTypes';

export const patternTemplates: TemplateDefinition[] = [
  {
    id: 'simple-web',
    name: 'Simple Web Application',
    description: 'Evolved 3-tier with DNS, auth, cache, and observability',
    category: 'patterns',
    build: () => {
      const b = new TemplateBuilder('Simple Web Application', 'Classic 3-tier web app with production extras');
      const edge = b.publicEdge(-12);
      const client = b.n('web-browser', { x: 0, y: 0, z: -12 }, { name: 'Browser Client' });
      b.e(client, edge.internet, 'HTTPS');
      const web = b.n('web-server', { x: -4, y: 0, z: -2 }, { name: 'Web Server' });
      const app = b.n('application-server', { x: 4, y: 0, z: -2 }, { name: 'App Server' });
      const cache = b.n('cache', { x: 8, y: 0, z: 2 }, { name: 'Session Cache' });
      const db = b.n('database', { x: 0, y: 0, z: 6 }, { name: 'Primary Database' });
      const replica = b.n('database', { x: -6, y: 0, z: 6 }, { name: 'Read Replica' });
      b.e(edge.lb, web, 'HTTPS').e(edge.gw, app, 'HTTP').e(edge.gw, edge.auth, 'gRPC');
      b.e(app, cache, 'TCP').e(app, db, 'TCP').e(db, replica, 'TCP').e(web, app, 'HTTP');
      b.observability(edge.gw);
      b.g('Edge', 'vpc', [edge.internet.id, edge.dns.id, edge.lb.id, edge.gw.id, edge.auth.id], { min: { x: -10, y: -1, z: -14 }, max: { x: 10, y: 3, z: -6 } });
      b.g('Application', 'service-group', [web.id, app.id, cache.id], { min: { x: -6, y: -1, z: -4 }, max: { x: 10, y: 3, z: 4 } });
      b.g('Data', 'database-cluster', [db.id, replica.id], { min: { x: -8, y: -1, z: 4 }, max: { x: 6, y: 3, z: 8 } });
      return b.build();
    },
  },
  {
    id: 'scalable-web',
    name: 'Scalable Web Application',
    description: 'CDN, WAF/LB, gateway, services, cache, DB, async workers',
    category: 'patterns',
    build: () => {
      const b = new TemplateBuilder('Scalable Web Application', 'Horizontally scaled web platform');
      const edge = b.publicEdge(-14);
      const clients = b.mobileAndWebClients(-14);
      b.e(clients.mobile, edge.internet, 'HTTPS');
      b.e(clients.web, edge.internet, 'HTTPS');
      const svcA = b.n('microservice', { x: -6, y: 0, z: -2 }, { name: 'Catalog Service' });
      const svcB = b.n('microservice', { x: 6, y: 0, z: -2 }, { name: 'Order Service' });
      const worker = b.n('worker', { x: 0, y: 0, z: 2 }, { name: 'Async Workers' });
      const cache = b.n('cache', { x: -6, y: 0, z: 6 }, { name: 'Redis Cache' });
      const db = b.n('database', { x: 6, y: 0, z: 6 }, { name: 'PostgreSQL' });
      const replica = b.n('database', { x: 10, y: 0, z: 6 }, { name: 'DB Replica' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 6 }, { name: 'Event Bus' });
      const search = b.n('search-engine', { x: -6, y: 0, z: 10 }, { name: 'Search Index' });
      b.e(edge.gw, svcA, 'gRPC').e(edge.gw, svcB, 'gRPC').e(svcB, kafka, 'Kafka').e(kafka, worker, 'Kafka');
      b.e(svcA, cache, 'TCP').e(svcB, db, 'TCP').e(db, replica, 'TCP').e(worker, search, 'HTTP');
      b.observability(edge.gw);
      b.g('Edge & CDN', 'region', [edge.internet.id, edge.cdn.id, edge.lb.id, edge.gw.id], { min: { x: -10, y: -1, z: -16 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Services', 'service-group', [svcA.id, svcB.id, worker.id, edge.auth.id], { min: { x: -8, y: -1, z: -4 }, max: { x: 8, y: 3, z: 4 } });
      b.g('Data', 'database-cluster', [cache.id, db.id, replica.id, kafka.id, search.id], { min: { x: -8, y: -1, z: 4 }, max: { x: 12, y: 3, z: 12 } });
      return b.build();
    },
  },
  {
    id: 'microservices',
    name: 'Microservices Architecture',
    description: 'Gateway, service mesh, per-service DB, events, observability',
    category: 'patterns',
    build: () => {
      const b = new TemplateBuilder('Microservices Architecture', 'Domain-driven microservices with event bus');
      const edge = b.publicEdge(-14);
      const client = b.n('client', { x: 0, y: 0, z: -14 });
      b.e(client, edge.internet, 'HTTPS');
      const auth = b.n('auth-service', { x: -8, y: 0, z: -2 }, { name: 'Auth Service' });
      const user = b.n('microservice', { x: -2, y: 0, z: -2 }, { name: 'User Service' });
      const order = b.n('microservice', { x: 4, y: 0, z: -2 }, { name: 'Order Service' });
      const payment = b.n('microservice', { x: 10, y: 0, z: -2 }, { name: 'Payment Service' });
      const inventory = b.n('microservice', { x: -5, y: 0, z: 2 }, { name: 'Inventory Service' });
      const userDb = b.n('database', { x: -2, y: 0, z: 6 }, { name: 'User DB' });
      const orderDb = b.n('database', { x: 4, y: 0, z: 6 }, { name: 'Order DB' });
      const payDb = b.n('database', { x: 10, y: 0, z: 6 }, { name: 'Payment DB' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 6 }, { name: 'Domain Events' });
      const cache = b.n('cache', { x: -8, y: 0, z: 6 }, { name: 'Token Cache' });
      b.e(edge.gw, auth, 'gRPC').e(edge.gw, user, 'gRPC').e(edge.gw, order, 'gRPC').e(edge.gw, payment, 'gRPC');
      b.e(order, payment, 'gRPC').e(order, inventory, 'gRPC').e(order, kafka, 'Kafka');
      b.e(user, userDb, 'TCP').e(order, orderDb, 'TCP').e(payment, payDb, 'TCP').e(auth, cache, 'TCP');
      b.observability(edge.gw);
      b.g('Edge', 'vpc', [edge.internet.id, edge.lb.id, edge.gw.id], { min: { x: -10, y: -1, z: -16 }, max: { x: 10, y: 3, z: -8 } });
      b.g('Microservices', 'service-group', [auth.id, user.id, order.id, payment.id, inventory.id], { min: { x: -10, y: -1, z: -4 }, max: { x: 12, y: 3, z: 4 } });
      b.g('Data', 'database-cluster', [userDb.id, orderDb.id, payDb.id, kafka.id, cache.id], { min: { x: -10, y: -1, z: 4 }, max: { x: 12, y: 3, z: 8 } });
      return b.build();
    },
  },
  {
    id: 'event-driven',
    name: 'Event-Driven Architecture',
    description: 'Producers, Kafka, stream processors, CQRS read models',
    category: 'patterns',
    build: () => {
      const b = new TemplateBuilder('Event-Driven Architecture', 'Event sourcing and async integration');
      const edge = b.publicEdge(-12);
      const order = b.n('microservice', { x: -8, y: 0, z: -2 }, { name: 'Order Service' });
      const inventory = b.n('microservice', { x: 8, y: 0, z: -2 }, { name: 'Inventory Service' });
      const billing = b.n('microservice', { x: 0, y: 0, z: -2 }, { name: 'Billing Service' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 2 }, { name: 'Kafka Cluster' });
      const stream = b.n('worker', { x: -6, y: 0, z: 6 }, { name: 'Stream Processors' });
      const saga = b.n('worker', { x: 6, y: 0, z: 6 }, { name: 'Saga Orchestrator' });
      const writeDb = b.n('database', { x: -4, y: 0, z: 10 }, { name: 'Write DB' });
      const readDb = b.n('database', { x: 4, y: 0, z: 10 }, { name: 'Read Model DB' });
      const cache = b.n('cache', { x: 0, y: 0, z: 10 }, { name: 'Materialized View Cache' });
      const dlq = b.n('message-queue', { x: 0, y: 0, z: 6 }, { name: 'Dead Letter Queue' });
      b.e(edge.gw, order, 'gRPC').e(edge.gw, inventory, 'gRPC').e(edge.gw, billing, 'gRPC');
      b.e(order, kafka, 'Kafka').e(inventory, kafka, 'Kafka').e(billing, kafka, 'Kafka');
      b.e(kafka, stream, 'Kafka').e(kafka, saga, 'Kafka').e(stream, readDb, 'TCP').e(stream, cache, 'TCP');
      b.e(saga, writeDb, 'TCP').e(kafka, dlq, 'Kafka');
      b.observability(edge.gw);
      b.g('Services', 'service-group', [order.id, inventory.id, billing.id, edge.gw.id], { min: { x: -10, y: -1, z: -4 }, max: { x: 10, y: 3, z: 0 } });
      b.g('Streaming', 'service-group', [kafka.id, stream.id, saga.id, dlq.id], { min: { x: -8, y: -1, z: 0 }, max: { x: 8, y: 3, z: 8 } });
      b.g('Storage', 'database-cluster', [writeDb.id, readDb.id, cache.id], { min: { x: -6, y: -1, z: 8 }, max: { x: 6, y: 3, z: 12 } });
      return b.build();
    },
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes Architecture',
    description: 'Multi-AZ cluster, ingress, services, stateful sets, observability stack',
    category: 'patterns',
    build: () => {
      const b = new TemplateBuilder('Kubernetes Architecture', 'Cloud-native deployment on Kubernetes');
      const internet = b.n('internet', { x: 0, y: 0, z: -14 });
      const dns = b.n('dns', { x: -6, y: 0, z: -12 });
      const lb = b.n('load-balancer', { x: 0, y: 0, z: -10 });
      const ingress = b.n('ingress', { x: 0, y: 0, z: -6 });
      const api = b.n('microservice', { x: -6, y: 0, z: 0 }, { name: 'API Pods' });
      const worker = b.n('worker', { x: 6, y: 0, z: 0 }, { name: 'Worker Pods' });
      const svc = b.n('microservice', { x: 0, y: 0, z: 2 }, { name: 'ClusterIP Services' });
      const redis = b.n('cache', { x: -6, y: 0, z: 6 }, { name: 'Redis StatefulSet' });
      const db = b.n('database', { x: 6, y: 0, z: 6 }, { name: 'Postgres StatefulSet' });
      const kafka = b.n('kafka', { x: 0, y: 0, z: 6 }, { name: 'Strimzi Kafka' });
      const monitoring = b.n('monitoring', { x: 10, y: 0, z: 0 }, { name: 'Prometheus / Grafana' });
      const logging = b.n('logging', { x: 10, y: 0, z: 4 }, { name: 'EFK Logging' });
      b.e(internet, dns, 'DNS').e(internet, lb, 'HTTPS').e(lb, ingress, 'HTTPS');
      b.e(ingress, svc, 'HTTPS').e(svc, api, 'TCP').e(svc, worker, 'TCP');
      b.e(api, redis, 'TCP').e(api, db, 'TCP').e(worker, kafka, 'Kafka');
      b.e(api, monitoring, 'HTTP').e(worker, logging, 'TCP');
      const clusterGroup = b.g('Kubernetes Cluster', 'kubernetes-cluster', [ingress.id, api.id, worker.id, svc.id, redis.id, db.id, kafka.id], { min: { x: -8, y: -1, z: -2 }, max: { x: 8, y: 3, z: 8 } }, '#3b82f630');
      void clusterGroup;
      b.g('Observability', 'namespace', [monitoring.id, logging.id], { min: { x: 8, y: -1, z: -2 }, max: { x: 12, y: 3, z: 6 } });
      return b.build();
    },
  },
];

export const templates: TemplateDefinition[] = [...patternTemplates, ...systemDesignTemplates];

export const templateCategories: { id: TemplateCategory; label: string }[] = [
  { id: 'patterns', label: 'Architecture Patterns' },
  { id: 'system-design', label: 'System Design Interview' },
];

export function getTemplatesByCategory(category: TemplateCategory): TemplateDefinition[] {
  return templates.filter((t) => (t.category ?? 'patterns') === category);
}


export function buildDemoArchitecture(): ArchitectureProject {
  const b = new TemplateBuilder(
    'E-Commerce Platform Demo',
    'Full-stack e-commerce reference: edge, services, cache, events, search, payments',
  );
  const edge = b.publicEdge(-18);
  const clients = b.mobileAndWebClients(-18);
  b.e(clients.mobile, edge.internet, 'HTTPS');
  b.e(clients.web, edge.internet, 'HTTPS');
  const auth = b.n('auth-service', { x: -10, y: 0, z: -6 }, { name: 'Auth Service' });
  const user = b.n('microservice', { x: -4, y: 0, z: -6 }, { name: 'User Service' });
  const catalog = b.n('microservice', { x: 2, y: 0, z: -6 }, { name: 'Catalog Service' });
  const cart = b.n('microservice', { x: 8, y: 0, z: -6 }, { name: 'Cart Service' });
  const order = b.n('microservice', { x: -4, y: 0, z: -2 }, { name: 'Order Service' });
  const payment = b.n('microservice', { x: 4, y: 0, z: -2 }, { name: 'Payment Service' });
  const notify = b.n('microservice', { x: 10, y: 0, z: -2 }, { name: 'Notification Service' });
  const redis = b.n('cache', { x: -4, y: 0, z: 4 }, { name: 'Redis Cache' });
  const kafka = b.n('kafka', { x: 4, y: 0, z: 4 }, { name: 'Kafka' });
  const workers = b.n('worker', { x: 10, y: 0, z: 4 }, { name: 'Fulfillment Workers' });
  const search = b.n('search-engine', { x: -10, y: 0, z: 4 }, { name: 'Product Search' });
  const db = b.n('database', { x: 0, y: 0, z: 10 }, { name: 'Orders DB' });
  const userDb = b.n('database', { x: -8, y: 0, z: 10 }, { name: 'User DB' });
  const stripe = b.n('external-api', { x: 6, y: 0, z: 10 }, { name: 'Stripe API' });
  b.e(edge.cdn, edge.lb, 'HTTPS');
  b.e(edge.gw, auth, 'gRPC').e(edge.gw, user, 'gRPC').e(edge.gw, catalog, 'gRPC').e(edge.gw, cart, 'gRPC');
  b.e(edge.gw, order, 'gRPC').e(order, payment, 'gRPC').e(order, kafka, 'Kafka');
  b.e(kafka, workers, 'Kafka').e(kafka, notify, 'Kafka');
  b.e(user, redis, 'TCP').e(cart, redis, 'TCP').e(catalog, search, 'HTTP');
  b.e(workers, db, 'TCP').e(order, db, 'TCP').e(payment, stripe, 'HTTPS');
  b.e(user, userDb, 'TCP').e(auth, redis, 'TCP');
  b.observability(edge.gw);
  b.g('Internet Edge', 'region', [edge.internet.id, edge.dns.id, edge.cdn.id], { min: { x: -8, y: -1, z: -20 }, max: { x: 8, y: 3, z: -12 } }, '#64748b30');
  b.g('Application Layer', 'service-group', [edge.lb.id, edge.gw.id, auth.id, user.id, catalog.id, cart.id, order.id, payment.id, notify.id], { min: { x: -12, y: -1, z: -8 }, max: { x: 12, y: 3, z: 0 } }, '#3b82f625');
  b.g('Data & Messaging', 'database-cluster', [redis.id, kafka.id, workers.id, search.id, db.id, userDb.id, stripe.id], { min: { x: -12, y: -1, z: 2 }, max: { x: 12, y: 3, z: 12 } }, '#f59e0b25');
  const project = b.build();
  project.settings.showMetrics = true;
  project.metadata.templateId = 'demo-ecommerce';
  return project;
}

export function loadTemplate(templateId: string): ArchitectureProject | null {
  const t = templates.find((x) => x.id === templateId);
  if (!t) return null;
  const project = t.build();
  project.metadata.templateId = templateId;
  project.metadata.updatedAt = new Date().toISOString();
  return project;
}

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return templates.find((t) => t.id === id);
}

export function createNewProjectId(): string {
  return generateId();
}
