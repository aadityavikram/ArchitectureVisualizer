import type { NodeType } from '@/types/architecture';
import type { ComponentType } from 'react';
import type { NodeGeometryProps } from './geometries/types';
import { ClientGeometry } from './geometries/ClientGeometry';
import { ServerGeometry } from './geometries/ServerGeometry';
import { DatabaseGeometry } from './geometries/DatabaseGeometry';
import { CacheGeometry } from './geometries/CacheGeometry';
import { QueueGeometry } from './geometries/QueueGeometry';
import { GatewayGeometry } from './geometries/GatewayGeometry';
import { NetworkGeometry } from './geometries/NetworkGeometry';
import { StorageGeometry } from './geometries/StorageGeometry';
import { GenericGeometry } from './geometries/GenericGeometry';

export type NodeGeometryComponent = ComponentType<NodeGeometryProps>;

const registry: Record<NodeType, NodeGeometryComponent> = {
  client: ClientGeometry,
  'web-browser': ClientGeometry,
  'mobile-app': ClientGeometry,
  'api-gateway': GatewayGeometry,
  'load-balancer': NetworkGeometry,
  cdn: NetworkGeometry,
  'web-server': ServerGeometry,
  'application-server': ServerGeometry,
  microservice: ServerGeometry,
  database: DatabaseGeometry,
  cache: CacheGeometry,
  'message-queue': QueueGeometry,
  kafka: QueueGeometry,
  worker: ServerGeometry,
  'object-storage': StorageGeometry,
  'search-engine': DatabaseGeometry,
  'auth-service': GatewayGeometry,
  'external-api': GenericGeometry,
  dns: NetworkGeometry,
  monitoring: GenericGeometry,
  logging: GenericGeometry,
  ingress: GatewayGeometry,
  internet: NetworkGeometry,
  custom: GenericGeometry,
};

export function getNodeGeometry(type: NodeType): NodeGeometryComponent {
  return registry[type] ?? GenericGeometry;
}

export const componentRegistry = registry;
