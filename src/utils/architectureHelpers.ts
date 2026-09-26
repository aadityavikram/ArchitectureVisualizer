import { v4 as uuidv4 } from 'uuid';
import type {
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureGroup,
  ArchitectureProject,
  NodeType,
  Position3D,
  ProjectSettings,
  Protocol,
  EdgeType,
} from '@/types/architecture';
import { getDefaultNodeName } from '@/data/componentLibrary';

export function generateId(): string {
  return uuidv4();
}

export const DEFAULT_SETTINGS: ProjectSettings = {
  themeId: 'dark',
  showLabels: true,
  showMetrics: false,
  showGrid: true,
  snapToGrid: false,
  gridSize: 1,
};

export function createEmptyProject(name = 'Untitled Architecture'): ArchitectureProject {
  const now = new Date().toISOString();
  return {
    version: 1,
    metadata: {
      name,
      description: '',
      createdAt: now,
      updatedAt: now,
    },
    nodes: [],
    edges: [],
    groups: [],
    camera: {
      position: { x: 12, y: 10, z: 12 },
      target: { x: 0, y: 0, z: 0 },
      zoom: 1,
    },
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function createNode(
  type: NodeType,
  position: Position3D,
  overrides?: Partial<ArchitectureNode>,
): ArchitectureNode {
  const baseName = overrides?.name ?? getDefaultNodeName(type);
  return {
    id: overrides?.id ?? generateId(),
    name: baseName,
    type,
    position,
    rotation: overrides?.rotation ?? { x: 0, y: 0, z: 0 },
    scale: overrides?.scale ?? { x: 1, y: 1, z: 1 },
    groupId: overrides?.groupId,
    metadata: {
      host: 'localhost',
      port: 8080,
      protocol: 'HTTP',
      replicas: 1,
      cpu: 25 + Math.floor(Math.random() * 30),
      memory: 30 + Math.floor(Math.random() * 40),
      requestsPerSec: 100 + Math.floor(Math.random() * 900),
      latencyMs: 20 + Math.floor(Math.random() * 80),
      throughputMbps: 10 + Math.floor(Math.random() * 90),
      errorRate: Math.random() * 2,
      connections: 50 + Math.floor(Math.random() * 500),
      ...overrides?.metadata,
    },
    status: overrides?.status ?? 'healthy',
  };
}

export function createEdge(
  sourceId: string,
  targetId: string,
  protocol: Protocol = 'HTTP',
  overrides?: Partial<ArchitectureEdge>,
): ArchitectureEdge {
  return {
    id: overrides?.id ?? generateId(),
    sourceId,
    targetId,
    type: overrides?.type ?? 'data-flow',
    protocol,
    label: overrides?.label ?? protocol,
    metadata: {
      latencyMs: 5 + Math.floor(Math.random() * 50),
      throughputMbps: 50 + Math.floor(Math.random() * 200),
      requestRate: 100 + Math.floor(Math.random() * 500),
      direction: 'forward',
      status: 'healthy',
      ...overrides?.metadata,
    },
  };
}

export function createGroup(
  name: string,
  type: ArchitectureGroup['type'],
  bounds: ArchitectureGroup['bounds'],
  overrides?: Partial<ArchitectureGroup>,
): ArchitectureGroup {
  return {
    id: overrides?.id ?? generateId(),
    name,
    type,
    parentGroupId: overrides?.parentGroupId,
    nodeIds: overrides?.nodeIds ?? [],
    bounds,
    color: overrides?.color ?? '#3b82f640',
  };
}

export function cloneProject(project: ArchitectureProject): ArchitectureProject {
  return JSON.parse(JSON.stringify(project)) as ArchitectureProject;
}

export function duplicateNode(node: ArchitectureNode, offset = 1.5): ArchitectureNode {
  const copy = JSON.parse(JSON.stringify(node)) as ArchitectureNode;
  copy.id = generateId();
  copy.name = `${node.name} Copy`;
  copy.position = {
    x: node.position.x + offset,
    y: node.position.y,
    z: node.position.z + offset,
  };
  return copy;
}

export function snapPosition(pos: Position3D, gridSize: number, enabled: boolean): Position3D {
  if (!enabled) return pos;
  const snap = (v: number) => Math.round(v / gridSize) * gridSize;
  return { x: snap(pos.x), y: snap(pos.y), z: snap(pos.z) };
}

export function distance3D(a: Position3D, b: Position3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function getNodesBounds(nodes: ArchitectureNode[]): { min: Position3D; max: Position3D } | null {
  if (nodes.length === 0) return null;
  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    minZ = Math.min(minZ, n.position.z);
    maxX = Math.max(maxX, n.position.x);
    maxY = Math.max(maxY, n.position.y);
    maxZ = Math.max(maxZ, n.position.z);
  }
  const pad = 2;
  return {
    min: { x: minX - pad, y: minY - pad, z: minZ - pad },
    max: { x: maxX + pad, y: maxY + pad, z: maxZ + pad },
  };
}

export const edgeTypeOptions: EdgeType[] = ['data-flow', 'dependency', 'replication', 'event'];

export const protocolOptions: Protocol[] = ['HTTP', 'HTTPS', 'TCP', 'gRPC', 'Kafka', 'WebSocket', 'DNS', 'AMQP'];
