import type { ArchitectureProject, ArchitectureNode } from '@/types/architecture';

export function exportMermaid(project: ArchitectureProject): string {
  const lines = ['graph TD'];
  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9_]/g, '_');
  const idMap = new Map<string, string>();
  project.nodes.forEach((n, i) => {
    idMap.set(n.id, `${sanitize(n.name)}_${i}`);
  });
  for (const n of project.nodes) {
    lines.push(`    ${idMap.get(n.id)}["${n.name}"]`);
  }
  for (const e of project.edges) {
    const src = idMap.get(e.sourceId);
    const tgt = idMap.get(e.targetId);
    if (src && tgt) {
      lines.push(`    ${src} -->|${e.protocol}| ${tgt}`);
    }
  }
  return lines.join('\n');
}

export function exportMarkdownDocs(project: ArchitectureProject): string {
  const lines: string[] = [];
  lines.push(`# ${project.metadata.name}`);
  lines.push('');
  if (project.metadata.description) {
    lines.push(project.metadata.description);
    lines.push('');
  }
  lines.push('## Components');
  lines.push('');
  for (const n of project.nodes) {
    lines.push(`### ${n.name}`);
    lines.push('');
    lines.push(`- **Type:** ${n.type}`);
    if (n.metadata.description) lines.push(`- ${n.metadata.description}`);
    if (n.metadata.host) lines.push(`- **Host:** ${n.metadata.host}`);
    if (n.metadata.port) lines.push(`- **Port:** ${n.metadata.port}`);
    lines.push('');
  }
  lines.push('## Connections');
  lines.push('');
  const nodeById = new Map(project.nodes.map((n) => [n.id, n]));
  for (const e of project.edges) {
    const src = nodeById.get(e.sourceId)?.name ?? e.sourceId;
    const tgt = nodeById.get(e.targetId)?.name ?? e.targetId;
    lines.push(`- ${src} → ${tgt} (${e.protocol})`);
  }
  lines.push('');
  lines.push(`## Groups`);
  lines.push('');
  for (const g of project.groups) {
    lines.push(`### ${g.name} (${g.type})`);
    lines.push('');
  }
  return lines.join('\n');
}

export function exportSvgDiagram(project: ArchitectureProject, width = 800, height = 600): string {
  const padding = 40;
  const positions = layout2D(project.nodes, project.edges);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of positions.values()) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  const scaleX = (width - padding * 2) / (maxX - minX || 1);
  const scaleY = (height - padding * 2) / (maxY - minY || 1);
  const scale = Math.min(scaleX, scaleY);

  const tx = (x: number) => padding + (x - minX) * scale;
  const ty = (y: number) => padding + (y - minY) * scale;

  const nodeById = new Map(project.nodes.map((n) => [n.id, n]));
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="#0f1419"/>`;

  for (const e of project.edges) {
    const sp = positions.get(e.sourceId);
    const tp = positions.get(e.targetId);
    if (!sp || !tp) continue;
    svg += `<line x1="${tx(sp.x)}" y1="${ty(sp.y)}" x2="${tx(tp.x)}" y2="${ty(tp.y)}" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"/>`;
  }

  svg += `<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#64748b"/></marker></defs>`;

  for (const n of project.nodes) {
    const p = positions.get(n.id);
    if (!p) continue;
    const x = tx(p.x);
    const y = ty(p.y);
    svg += `<rect x="${x - 50}" y="${y - 20}" width="100" height="40" rx="6" fill="#1c2430" stroke="#3b82f6"/>`;
    svg += `<text x="${x}" y="${y + 5}" text-anchor="middle" fill="#e6edf3" font-family="sans-serif" font-size="12">${escapeXml(n.name)}</text>`;
  }

  svg += '</svg>';
  void nodeById;
  return svg;
}

function layout2D(nodes: ArchitectureNode[], edges: { sourceId: string; targetId: string }[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const layers: string[][] = [];
  const inDeg = new Map<string, number>();
  nodes.forEach((n) => inDeg.set(n.id, 0));
  edges.forEach((e) => inDeg.set(e.targetId, (inDeg.get(e.targetId) ?? 0) + 1));
  let queue = nodes.filter((n) => (inDeg.get(n.id) ?? 0) === 0).map((n) => n.id);
  const visited = new Set<string>();
  while (queue.length) {
    layers.push([...queue]);
    const next: string[] = [];
    for (const id of queue) {
      visited.add(id);
      for (const e of edges) {
        if (e.sourceId === id && !visited.has(e.targetId)) {
          const d = (inDeg.get(e.targetId) ?? 1) - 1;
          inDeg.set(e.targetId, d);
          if (d <= 0) next.push(e.targetId);
        }
      }
    }
    queue = next;
  }
  const rest = nodes.filter((n) => !visited.has(n.id)).map((n) => n.id);
  if (rest.length) layers.push(rest);
  layers.forEach((layer, li) => {
    layer.forEach((id, i) => {
      positions.set(id, { x: i * 120, y: li * 100 });
    });
  });
  return positions;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function downloadFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
