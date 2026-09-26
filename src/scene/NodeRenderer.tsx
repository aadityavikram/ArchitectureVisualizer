import { useRef, useState, useMemo } from 'react';
import { Html } from '@react-three/drei';
import type { Group } from 'three';
import type { ArchitectureNode } from '@/types/architecture';
import { getNodeGeometry } from '@/scene/componentRegistry';
import { getNodeColor, getUtilizationColor, getTheme } from '@/themes';
import { useArchitectureStore } from '@/store/architectureStore';

type Props = {
  node: ArchitectureNode;
  selected: boolean;
  showLabel: boolean;
  showMetrics: boolean;
  metricsMode: boolean;
};

export function ArchitectureNodeMesh({ node, selected, showLabel, showMetrics, metricsMode }: Props) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const selectNode = useArchitectureStore((s) => s.selectNode);
  const theme = getTheme(useArchitectureStore.getState().project.settings.themeId as 'dark');
  const color = getNodeColor(node.type, theme);
  const cpu = node.metadata.cpu ?? 0;
  const utilizationColor = metricsMode ? getUtilizationColor(cpu, theme) : undefined;
  const Geometry = getNodeGeometry(node.type);

  const statusLabel = node.status !== 'healthy' ? node.status.toUpperCase() : null;

  const metricsText = useMemo(() => {
    if (!showMetrics && !metricsMode) return null;
    const parts = [];
    if (node.metadata.cpu !== undefined) parts.push(`CPU ${node.metadata.cpu}%`);
    if (node.metadata.requestsPerSec !== undefined) parts.push(`${node.metadata.requestsPerSec} req/s`);
    if (node.metadata.latencyMs !== undefined) parts.push(`${node.metadata.latencyMs}ms`);
    return parts.join(' · ');
  }, [node.metadata, showMetrics, metricsMode]);

  return (
    <group
      ref={groupRef}
      position={[node.position.x, node.position.y, node.position.z]}
      rotation={[node.rotation.x, node.rotation.y, node.rotation.z]}
      scale={[node.scale.x, node.scale.y, node.scale.z]}
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id, e.shiftKey);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      <Geometry
        color={color}
        selected={selected}
        hovered={hovered}
        status={node.status}
        utilizationColor={utilizationColor}
      />
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[1.1, 1.25, 32]} />
          <meshBasicMaterial color={theme.node.selection} transparent opacity={0.8} />
        </mesh>
      )}
      {(showLabel || hovered || selected) && (
        <Html center distanceFactor={12} position={[0, 1.6, 0]} style={{ pointerEvents: 'none' }}>
          <div className="flex flex-col items-center gap-0.5">
            <span className="whitespace-nowrap rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {node.name}
            </span>
            {statusLabel && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                  node.status === 'failed' ? 'bg-red-500/80' : 'bg-yellow-500/80'
                } text-black`}
              >
                {statusLabel}
              </span>
            )}
            {metricsText && (
              <span className="whitespace-nowrap rounded bg-surface-overlay/90 px-1.5 py-0.5 font-mono text-[10px] text-accent-glow">
                {metricsText}
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}