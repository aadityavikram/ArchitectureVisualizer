import type { ArchitectureProject, ArchitectureEdge, SimulationState } from '@/types/architecture';

export type TrafficParticle = {
  edgeId: string;
  progress: number;
  kind: SimulationState['trafficType'];
};

export function computeEdgeLoad(edge: ArchitectureEdge, simulation: SimulationState): number {
  const base = edge.metadata.requestRate ?? 100;
  const speed = simulation.speed;
  const errorFactor = simulation.trafficType === 'error' ? simulation.errorRate * 5 : 1;
  return base * speed * errorFactor;
}

export function shouldShowEdgeTraffic(edge: ArchitectureEdge, simulation: SimulationState): boolean {
  if (!simulation.active) return false;
  if (simulation.traceEdgeIds.length > 0) {
    return simulation.traceEdgeIds.includes(edge.id);
  }
  if (edge.metadata.status === 'failed' && simulation.trafficType !== 'error') {
    return false;
  }
  return true;
}

export function applyFailureCascade(project: ArchitectureProject, failedNodeId: string): ArchitectureProject {
  const next = structuredClone(project) as ArchitectureProject;
  for (const n of next.nodes) {
    if (n.id === failedNodeId) n.status = 'failed';
  }
  for (const e of next.edges) {
    if (e.sourceId === failedNodeId || e.targetId === failedNodeId) {
      e.metadata.status = 'failed';
    }
  }
  return next;
}

export function resetHealth(project: ArchitectureProject): ArchitectureProject {
  const next = structuredClone(project) as ArchitectureProject;
  for (const n of next.nodes) n.status = 'healthy';
  for (const e of next.edges) e.metadata.status = 'healthy';
  return next;
}

export function tracePath(project: ArchitectureProject, startNodeId: string): string[] {
  const edgeIds: string[] = [];
  let current: string | undefined = startNodeId;
  const visited = new Set<string>();
  while (current && !visited.has(current)) {
    visited.add(current);
    const edge = project.edges.find((e) => e.sourceId === current);
    if (!edge) break;
    edgeIds.push(edge.id);
    current = edge.targetId;
  }
  return edgeIds;
}
