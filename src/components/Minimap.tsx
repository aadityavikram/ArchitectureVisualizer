import { useArchitectureStore } from '@/store/architectureStore';
import { useProject, useSelection } from '@/store/architectureStore';

export function Minimap() {
  const project = useProject();
  const selection = useSelection();
  const visible = useArchitectureStore((s) => s.ui.minimapVisible);
  const presentation = useArchitectureStore((s) => s.ui.presentationMode);

  if (!visible || presentation) return null;

  const bounds = project.nodes.reduce(
    (acc, n) => ({
      minX: Math.min(acc.minX, n.position.x),
      maxX: Math.max(acc.maxX, n.position.x),
      minZ: Math.min(acc.minZ, n.position.z),
      maxZ: Math.max(acc.maxZ, n.position.z),
    }),
    { minX: -5, maxX: 5, minZ: -5, maxZ: 5 },
  );

  const pad = 2;
  const w = bounds.maxX - bounds.minX + pad * 2 || 10;
  const h = bounds.maxZ - bounds.minZ + pad * 2 || 10;

  const toX = (x: number) => ((x - bounds.minX + pad) / w) * 100;
  const toY = (z: number) => ((z - bounds.minZ + pad) / h) * 100;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const wx = bounds.minX - pad + px * w;
    const wz = bounds.minZ - pad + py * h;
    window.dispatchEvent(
      new CustomEvent('architecture:camera-view', { detail: { view: 'focus-point', x: wx, z: wz } }),
    );
    window.dispatchEvent(new CustomEvent('architecture:focus-selection'));
  };

  return (
    <div
      className="absolute bottom-36 right-2 z-20 hidden h-24 w-32 cursor-crosshair rounded-lg border border-surface-border bg-black/60 p-2 backdrop-blur-md md:block lg:bottom-14 lg:right-4 lg:h-28 lg:w-40"
      onClick={handleClick}
      role="img"
      aria-label="Scene minimap"
    >
      <div className="relative h-full w-full">
        {project.edges.map((edge) => {
          const s = project.nodes.find((n) => n.id === edge.sourceId);
          const t = project.nodes.find((n) => n.id === edge.targetId);
          if (!s || !t) return null;
          return (
            <svg key={edge.id} className="pointer-events-none absolute inset-0 h-full w-full">
              <line
                x1={`${toX(s.position.x)}%`}
                y1={`${toY(s.position.z)}%`}
                x2={`${toX(t.position.x)}%`}
                y2={`${toY(t.position.z)}%`}
                stroke="#475569"
                strokeWidth={1}
              />
            </svg>
          );
        })}
        {project.nodes.map((n) => (
          <div
            key={n.id}
            className={`absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
              selection.nodeIds.includes(n.id) ? 'bg-accent-glow ring-1 ring-white' : 'bg-accent'
            }`}
            style={{ left: `${toX(n.position.x)}%`, top: `${toY(n.position.z)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
