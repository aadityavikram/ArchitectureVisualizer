export type Position3D = {
  x: number;
  y: number;
  z: number;
};

export type Rotation3D = {
  x: number;
  y: number;
  z: number;
};

export type Scale3D = {
  x: number;
  y: number;
  z: number;
};

export type NodeType =
  | 'client'
  | 'web-browser'
  | 'mobile-app'
  | 'api-gateway'
  | 'load-balancer'
  | 'cdn'
  | 'web-server'
  | 'application-server'
  | 'microservice'
  | 'database'
  | 'cache'
  | 'message-queue'
  | 'kafka'
  | 'worker'
  | 'object-storage'
  | 'search-engine'
  | 'auth-service'
  | 'external-api'
  | 'dns'
  | 'monitoring'
  | 'logging'
  | 'ingress'
  | 'internet'
  | 'custom';

export type EdgeType = 'data-flow' | 'dependency' | 'replication' | 'event';

export type Protocol =
  | 'HTTP'
  | 'HTTPS'
  | 'TCP'
  | 'gRPC'
  | 'Kafka'
  | 'WebSocket'
  | 'DNS'
  | 'AMQP';

export type NodeStatus = 'healthy' | 'degraded' | 'failed';

export type NodeMetadata = {
  host?: string;
  port?: number;
  protocol?: Protocol;
  replicas?: number;
  cpu?: number;
  memory?: number;
  requestsPerSec?: number;
  latencyMs?: number;
  throughputMbps?: number;
  errorRate?: number;
  connections?: number;
  description?: string;
  customFields?: Record<string, string | number>;
};

export type ArchitectureNode = {
  id: string;
  name: string;
  type: NodeType;
  position: Position3D;
  rotation: Rotation3D;
  scale: Scale3D;
  groupId?: string;
  metadata: NodeMetadata;
  status: NodeStatus;
};

export type ArchitectureEdge = {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  protocol: Protocol;
  label?: string;
  metadata: {
    port?: number;
    latencyMs?: number;
    throughputMbps?: number;
    requestRate?: number;
    direction?: 'forward' | 'bidirectional';
    status?: NodeStatus;
  };
};

export type GroupType =
  | 'vpc'
  | 'region'
  | 'availability-zone'
  | 'kubernetes-cluster'
  | 'namespace'
  | 'service-group'
  | 'database-cluster'
  | 'custom';

export type ArchitectureGroup = {
  id: string;
  name: string;
  type: GroupType;
  parentGroupId?: string;
  nodeIds: string[];
  bounds: {
    min: Position3D;
    max: Position3D;
  };
  color?: string;
};

export type CameraState = {
  position: Position3D;
  target: Position3D;
  zoom: number;
};

export type ProjectSettings = {
  themeId: string;
  showLabels: boolean;
  showMetrics: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
};

export type ProjectMetadata = {
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  author?: string;
  /** Set when loaded from a built-in template or demo */
  templateId?: string;
};

export type ArchitectureProject = {
  version: number;
  metadata: ProjectMetadata;
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  groups: ArchitectureGroup[];
  camera: CameraState;
  settings: ProjectSettings;
};

export type TransformMode = 'translate' | 'rotate' | 'scale';

export type SimulationState = {
  active: boolean;
  speed: number;
  requestRate: number;
  packetRate: number;
  errorRate: number;
  latencyMultiplier: number;
  trafficType: 'request' | 'response' | 'error' | 'replication' | 'event';
  traceEdgeIds: string[];
};

export type PresentationSlide = {
  id: string;
  name: string;
  camera: CameraState;
  highlightedNodeIds: string[];
};

export type UIState = {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  fullscreenViewport: boolean;
  commandPaletteOpen: boolean;
  contextMenu: { x: number; y: number; targetId?: string; targetType?: 'node' | 'edge' | 'canvas' } | null;
  connectionMode: boolean;
  connectionSourceId: string | null;
  transformMode: TransformMode;
  presentationMode: boolean;
  metricsMode: boolean;
  validationPanelOpen: boolean;
  minimapVisible: boolean;
  toasts: ToastMessage[];
};

export type ToastMessage = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
};

export type ValidationIssue = {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  nodeId?: string;
  edgeId?: string;
};

export type HistoryEntry = {
  project: ArchitectureProject;
  selection: SelectionState;
};

export type SelectionState = {
  nodeIds: string[];
  edgeIds: string[];
  groupIds: string[];
};

export type CommandPaletteItem = {
  id: string;
  label: string;
  category: 'node' | 'edge' | 'action' | 'template';
  keywords: string[];
  action: () => void;
};

export type ThemeId = 'dark' | 'light' | 'cyber' | 'blueprint';

export type AppTheme = {
  id: ThemeId;
  name: string;
  ui: {
    background: string;
    surface: string;
    surfaceRaised: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
    accentMuted: string;
    success: string;
    warning: string;
    error: string;
  };
  scene: {
    background: string;
    fog: string;
    gridPrimary: string;
    gridSecondary: string;
    ambientIntensity: number;
    directionalIntensity: number;
  };
  node: {
    selection: string;
    hover: string;
    healthy: string;
    degraded: string;
    failed: string;
    utilizationLow: string;
    utilizationMedium: string;
    utilizationHigh: string;
  };
  edge: {
    default: string;
    active: string;
    error: string;
    particle: string;
  };
};

export type LibraryCategory =
  | 'clients'
  | 'networking'
  | 'compute'
  | 'databases'
  | 'caching'
  | 'messaging'
  | 'storage'
  | 'security'
  | 'observability'
  | 'external';

export type LibraryItem = {
  type: NodeType;
  name: string;
  description: string;
  category: LibraryCategory;
  defaultMetadata?: Partial<NodeMetadata>;
};

export type LayoutAlgorithm = 'hierarchical' | 'force-directed' | 'grid' | 'radial';
