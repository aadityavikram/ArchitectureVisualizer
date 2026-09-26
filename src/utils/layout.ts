import type { ArchitectureNode, ArchitectureEdge, LayoutAlgorithm, Position3D } from '@/types/architecture';

export function layoutHierarchical(nodes: ArchitectureNode[], edges: ArchitectureEdge[]): Map<string, Position3D> {
  const positions = new Map<string, Position3D>();
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  }
  for (const e of edges) {
    adj.get(e.sourceId)?.push(e.targetId);
    inDegree.set(e.targetId, (inDegree.get(e.targetId) ?? 0) + 1);
  }

  const layers: string[][] = [];
  const queue = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0).map((n) => n.id);
  const visited = new Set<string>();

  while (queue.length > 0) {
    const layer = [...queue];
    layers.push(layer);
    queue.length = 0;
    for (const id of layer) {
      visited.add(id);
      for (const next of adj.get(id) ?? []) {
        if (!visited.has(next)) {
          const deg = (inDegree.get(next) ?? 1) - 1;
          inDegree.set(next, deg);
          if (deg <= 0) queue.push(next);
        }
      }
    }
  }

  const remaining = nodes.filter((n) => !visited.has(n.id)).map((n) => n.id);
  if (remaining.length) layers.push(remaining);

  const xSpacing = 3;
  const zSpacing = 4;
  layers.forEach((layer, layerIdx) => {
    const offset = ((layer.length - 1) * xSpacing) / 2;
    layer.forEach((id, i) => {
      positions.set(id, {
        x: i * xSpacing - offset,
        y: 0,
        z: layerIdx * zSpacing,
      });
    });
  });

  return positions;
}

export function layoutGrid(nodes: ArchitectureNode[]): Map<string, Position3D> {
  const positions = new Map<string, Position3D>();
  const cols = Math.ceil(Math.sqrt(nodes.length));
  const spacing = 3;
  nodes.forEach((n, i) => {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.set(n.id, {
      x: col * spacing - ((cols - 1) * spacing) / 2,
      y: 0,
      z: row * spacing,
    });
  });
  return positions;
}

export function layoutRadial(nodes: ArchitectureNode[], edges: ArchitectureEdge[]): Map<string, Position3D> {
  const positions = new Map<string, Position3D>();
  if (nodes.length === 0) return positions;

  const inDegree = new Map<string, number>();
  for (const n of nodes) inDegree.set(n.id, 0);
  for (const e of edges) inDegree.set(e.targetId, (inDegree.get(e.targetId) ?? 0) + 1);
  const root = nodes.find((n) => (inDegree.get(n.id) ?? 0) === 0) ?? nodes[0];
  positions.set(root.id, { x: 0, y: 0, z: 0 });

  const others = nodes.filter((n) => n.id !== root.id);
  const radius = 5;
  others.forEach((n, i) => {
    const angle = (i / others.length) * Math.PI * 2;
    positions.set(n.id, {
      x: Math.cos(angle) * radius,
      y: 0,
      z: Math.sin(angle) * radius,
    });
  });
  return positions;
}

export function layoutForceDirected(
  nodes: ArchitectureNode[],
  edges: ArchitectureEdge[],
  iterations = 50,
): Map<string, Position3D> {
  const positions = new Map<string, Position3D>();
  nodes.forEach((n, i) => {
    positions.set(n.id, {
      x: n.position.x || (i % 5) * 2 - 4,
      y: 0,
      z: n.position.z || Math.floor(i / 5) * 2,
    });
  });

  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<string, { x: number; z: number }>();
    for (const n of nodes) forces.set(n.id, { x: 0, z: 0 });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const pa = positions.get(a.id)!;
        const pb = positions.get(b.id)!;
        let dx = pa.x - pb.x;
        let dz = pa.z - pb.z;
        const dist = Math.sqrt(dx * dx + dz * dz) || 0.01;
        const repulsion = 2 / (dist * dist);
        dx = (dx / dist) * repulsion;
        dz = (dz / dist) * repulsion;
        forces.get(a.id)!.x += dx;
        forces.get(a.id)!.z += dz;
        forces.get(b.id)!.x -= dx;
        forces.get(b.id)!.z -= dz;
      }
    }

    for (const e of edges) {
      const pa = positions.get(e.sourceId);
      const pb = positions.get(e.targetId);
      if (!pa || !pb) continue;
      let dx = pb.x - pa.x;
      let dz = pb.z - pa.z;
      const dist = Math.sqrt(dx * dx + dz * dz) || 0.01;
      const attraction = (dist - 3) * 0.1;
      dx = (dx / dist) * attraction;
      dz = (dz / dist) * attraction;
      forces.get(e.sourceId)!.x += dx;
      forces.get(e.sourceId)!.z += dz;
      forces.get(e.targetId)!.x -= dx;
      forces.get(e.targetId)!.z -= dz;
    }

    for (const n of nodes) {
      const f = forces.get(n.id)!;
      const p = positions.get(n.id)!;
      p.x += f.x * 0.5;
      p.z += f.z * 0.5;
    }
  }

  return positions;
}

export function runAutoLayout(
  algorithm: LayoutAlgorithm,
  nodes: ArchitectureNode[],
  edges: ArchitectureEdge[],
): Map<string, Position3D> {
  switch (algorithm) {
    case 'hierarchical':
      return layoutHierarchical(nodes, edges);
    case 'grid':
      return layoutGrid(nodes);
    case 'radial':
      return layoutRadial(nodes, edges);
    case 'force-directed':
    default:
      return layoutForceDirected(nodes, edges);
  }
}
