import type { ArchitectureProject, ValidationIssue } from '@/types/architecture';

export function validateArchitecture(project: ArchitectureProject): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const nodeIds = new Set(project.nodes.map((n) => n.id));
  const idCounts = new Map<string, number>();

  for (const n of project.nodes) {
    idCounts.set(n.id, (idCounts.get(n.id) ?? 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) {
      issues.push({
        id: `dup-${id}`,
        severity: 'error',
        message: `Duplicate node ID: ${id}`,
        nodeId: id,
      });
    }
  }

  const connected = new Set<string>();
  for (const e of project.edges) {
    if (!nodeIds.has(e.sourceId)) {
      issues.push({
        id: `edge-src-${e.id}`,
        severity: 'error',
        message: `Edge references missing source node`,
        edgeId: e.id,
      });
    }
    if (!nodeIds.has(e.targetId)) {
      issues.push({
        id: `edge-tgt-${e.id}`,
        severity: 'error',
        message: `Edge references missing target node`,
        edgeId: e.id,
      });
    }
    connected.add(e.sourceId);
    connected.add(e.targetId);
  }

  for (const n of project.nodes) {
    if (!connected.has(n.id) && project.nodes.length > 1) {
      issues.push({
        id: `iso-${n.id}`,
        severity: 'warning',
        message: `"${n.name}" is not connected to any other component`,
        nodeId: n.id,
      });
    }
    if (n.metadata.cpu !== undefined && n.metadata.cpu > 95) {
      issues.push({
        id: `overload-${n.id}`,
        severity: 'warning',
        message: `"${n.name}" may be overloaded (CPU ${n.metadata.cpu}%)`,
        nodeId: n.id,
      });
    }
    if ((n.type === 'database' || n.type === 'cache') && !n.metadata.port) {
      issues.push({
        id: `cfg-${n.id}`,
        severity: 'info',
        message: `"${n.name}" has no port configured`,
        nodeId: n.id,
      });
    }
  }

  const cycles = detectCycles(project);
  for (const cycle of cycles) {
    issues.push({
      id: `cycle-${cycle.join('-')}`,
      severity: 'warning',
      message: `Potential dependency cycle detected (${cycle.length} nodes)`,
      nodeId: cycle[0],
    });
  }

  return issues;
}

function detectCycles(project: ArchitectureProject): string[][] {
  const adj = new Map<string, string[]>();
  for (const n of project.nodes) adj.set(n.id, []);
  for (const e of project.edges) {
    if (e.type === 'dependency') {
      adj.get(e.sourceId)?.push(e.targetId);
    }
  }

  const cycles: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const stack: string[] = [];

  function dfs(id: string): void {
    if (visited.has(id)) return;
    if (visiting.has(id)) {
      const idx = stack.indexOf(id);
      if (idx >= 0) cycles.push(stack.slice(idx));
      return;
    }
    visiting.add(id);
    stack.push(id);
    for (const next of adj.get(id) ?? []) dfs(next);
    stack.pop();
    visiting.delete(id);
    visited.add(id);
  }

  for (const n of project.nodes) dfs(n.id);
  return cycles;
}

export function isArchitectureValid(issues: ValidationIssue[]): boolean {
  return !issues.some((i) => i.severity === 'error');
}
