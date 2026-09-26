import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { ArchitectureEdge, ArchitectureNode } from '@/types/architecture';
import { getTheme } from '@/themes';
import { useArchitectureStore } from '@/store/architectureStore';

type Props = {
  edge: ArchitectureEdge;
  nodesById: Map<string, ArchitectureNode>;
  selected: boolean;
  simulationActive: boolean;
  traced: boolean;
  dimmed: boolean;
};

function getCurvePoints(source: ArchitectureNode, target: ArchitectureNode): THREE.Vector3[] {
  const start = new THREE.Vector3(source.position.x, source.position.y + 0.8, source.position.z);
  const end = new THREE.Vector3(target.position.x, target.position.y + 0.8, target.position.z);
  const mid = start.clone().lerp(end, 0.5);
  mid.y += Math.max(1, start.distanceTo(end) * 0.25);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(32);
}

export function ArchitectureEdgeMesh({ edge, nodesById, selected, simulationActive, traced, dimmed }: Props) {
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const theme = getTheme(useArchitectureStore.getState().project.settings.themeId as 'dark');
  const selectEdge = useArchitectureStore((s) => s.selectEdge);
  const source = nodesById.get(edge.sourceId);
  const target = nodesById.get(edge.targetId);

  const { points, curve } = useMemo(() => {
    if (!source || !target) return { points: [] as THREE.Vector3[], curve: null as THREE.QuadraticBezierCurve3 | null };
    const start = new THREE.Vector3(source.position.x, source.position.y + 0.8, source.position.z);
    const end = new THREE.Vector3(target.position.x, target.position.y + 0.8, target.position.z);
    const mid = start.clone().lerp(end, 0.5);
    mid.y += Math.max(1, start.distanceTo(end) * 0.25);
    const c = new THREE.QuadraticBezierCurve3(start, mid, end);
    return { points: c.getPoints(32), curve: c };
  }, [source, target]);

  const color =
    edge.metadata.status === 'failed'
      ? theme.edge.error
      : traced
        ? theme.edge.active
        : selected
          ? theme.node.selection
          : theme.edge.default;

  const opacity = dimmed ? 0.15 : edge.metadata.status === 'failed' ? 0.5 : 0.85;
  const particleCount = 8;

  useFrame(({ clock }) => {
    if (!simulationActive || !particlesRef.current || !curve) return;
    const t0 = clock.getElapsedTime() * useArchitectureStore.getState().simulation.speed;
    const matrix = new THREE.Matrix4();
    for (let i = 0; i < particleCount; i++) {
      const t = ((t0 * 0.3 + i / particleCount) % 1);
      const pos = curve.getPoint(t);
      matrix.setPosition(pos);
      particlesRef.current.setMatrixAt(i, matrix);
    }
    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!source || !target || points.length === 0) return null;

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        selectEdge(edge.id, e.shiftKey);
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <Line points={points} color={color} transparent opacity={opacity} lineWidth={2} />
      {simulationActive && curve && (
        <instancedMesh ref={particlesRef} args={[undefined, undefined, particleCount]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={theme.edge.particle} transparent opacity={0.9} />
        </instancedMesh>
      )}
    </group>
  );
}

export function EdgeRendererList({
  edges,
  nodes,
  selection,
  simulation,
}: {
  edges: ArchitectureEdge[];
  nodes: ArchitectureNode[];
  selection: string[];
  simulation: { active: boolean; traceEdgeIds: string[] };
}) {
  const nodesById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const traceSet = useMemo(() => new Set(simulation.traceEdgeIds), [simulation.traceEdgeIds]);
  const hasTrace = simulation.traceEdgeIds.length > 0;

  return (
    <>
      {edges.map((edge) => (
        <ArchitectureEdgeMesh
          key={edge.id}
          edge={edge}
          nodesById={nodesById}
          selected={selection.includes(edge.id)}
          simulationActive={simulation.active}
          traced={traceSet.has(edge.id)}
          dimmed={hasTrace && !traceSet.has(edge.id)}
        />
      ))}
    </>
  );
}

export { getCurvePoints };
