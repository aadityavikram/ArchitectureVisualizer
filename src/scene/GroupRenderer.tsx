import { Html } from '@react-three/drei';
import { BoxGeometry, EdgesGeometry } from 'three';
import type { ArchitectureGroup } from '@/types/architecture';

type Props = {
  group: ArchitectureGroup;
};

export function GroupRenderer({ group }: Props) {
  const { min, max } = group.bounds;
  const width = max.x - min.x;
  const depth = max.z - min.z;
  const height = Math.max(2, max.y - min.y);
  const cx = (min.x + max.x) / 2;
  const cy = min.y + height / 2;
  const cz = (min.z + max.z) / 2;
  const baseColor = (group.color ?? '#3b82f6').slice(0, 7);

  const edgesGeo = new EdgesGeometry(new BoxGeometry(width, height, depth));

  return (
    <group position={[cx, cy, cz]}>
      <mesh>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={baseColor} transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edgesGeo}>
        <lineBasicMaterial color={baseColor} transparent opacity={0.35} />
      </lineSegments>
      <Html position={[0, height / 2 + 0.5, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }}>
        <span className="rounded border border-white/10 bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/70">
          {group.name}
        </span>
      </Html>
    </group>
  );
}
