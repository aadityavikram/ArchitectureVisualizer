import type { ArchitectureGroup, ArchitectureProject, ArchitectureEdge } from '@/types/architecture';
import { createEmptyProject, createNode, createEdge, createGroup } from '@/utils/architectureHelpers';

export type ArchNode = ReturnType<typeof createNode>;

type Bounds = ArchitectureGroup['bounds'];

export class TemplateBuilder {
  readonly project: ArchitectureProject;
  readonly nodes: ArchNode[] = [];
  readonly edges: ArchitectureEdge[] = [];
  readonly groups: ArchitectureGroup[] = [];

  constructor(name: string, description = '') {
    this.project = createEmptyProject(name);
    this.project.metadata.description = description;
  }

  n(type: ArchNode['type'], position: ArchNode['position'], overrides?: Partial<ArchNode>): ArchNode {
    const node = createNode(type, position, overrides);
    this.nodes.push(node);
    return node;
  }

  e(source: ArchNode, target: ArchNode, protocol: ArchitectureEdge['protocol'] = 'HTTPS'): this {
    this.edges.push(createEdge(source.id, target.id, protocol));
    return this;
  }

  chain(nodes: ArchNode[], protocol: ArchitectureEdge['protocol'] = 'HTTPS'): this {
    for (let i = 0; i < nodes.length - 1; i++) {
      this.e(nodes[i], nodes[i + 1], protocol);
    }
    return this;
  }

  /** Standard public entry: Internet → DNS, CDN, LB → API Gateway → Auth */
  publicEdge(z = -14): {
    internet: ArchNode;
    dns: ArchNode;
    cdn: ArchNode;
    lb: ArchNode;
    gw: ArchNode;
    auth: ArchNode;
  } {
    const internet = this.n('internet', { x: 0, y: 0, z });
    const dns = this.n('dns', { x: -7, y: 0, z: z + 2 });
    const cdn = this.n('cdn', { x: 7, y: 0, z: z + 2 });
    const lb = this.n('load-balancer', { x: 0, y: 0, z: z + 4 });
    const gw = this.n('api-gateway', { x: 0, y: 0, z: z + 7 });
    const auth = this.n('auth-service', { x: -9, y: 0, z: z + 7 }, { name: 'Auth / IAM' });

    this.e(internet, dns, 'DNS');
    this.e(internet, cdn, 'HTTPS');
    this.e(internet, lb, 'HTTPS');
    this.e(lb, gw, 'HTTPS');
    this.e(gw, auth, 'gRPC');

    return { internet, dns, cdn, lb, gw, auth };
  }

  mobileAndWebClients(z = -14): { mobile: ArchNode; web: ArchNode } {
    const mobile = this.n('mobile-app', { x: -4, y: 0, z }, { name: 'Mobile Client' });
    const web = this.n('web-browser', { x: 4, y: 0, z }, { name: 'Web Client' });
    return { mobile, web };
  }

  observability(gw: ArchNode, zOffset = 0): { monitoring: ArchNode; logging: ArchNode } {
    const monitoring = this.n('monitoring', { x: 11, y: 0, z: gw.position.z + zOffset }, { name: 'Metrics / APM' });
    const logging = this.n('logging', { x: 11, y: 0, z: gw.position.z + 3 + zOffset }, { name: 'Central Logging' });
    this.e(gw, monitoring, 'HTTP');
    this.e(gw, logging, 'TCP');
    return { monitoring, logging };
  }

  g(name: string, type: ArchitectureGroup['type'], nodeIds: string[], bounds: Bounds, color?: string): ArchitectureGroup {
    const group = createGroup(name, type, bounds, { nodeIds, color });
    this.groups.push(group);
    for (const id of nodeIds) {
      const node = this.nodes.find((x) => x.id === id);
      if (node) node.groupId = group.id;
    }
    return group;
  }

  build(): ArchitectureProject {
    this.project.nodes = this.nodes;
    this.project.edges = this.edges;
    this.project.groups = this.groups;
    return this.project;
  }
}

export function wireClientsToLb(clients: ArchNode[], lb: ArchNode, b: TemplateBuilder): void {
  for (const c of clients) {
    b.e(c, lb, 'HTTPS');
  }
}
