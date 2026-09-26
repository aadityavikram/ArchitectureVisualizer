import type { NodeGeometryProps } from './types';

export function CacheGeometry({ color, selected, hovered, status }: NodeGeometryProps) {
  const emissive = selected ? '#4488ff' : hovered ? '#3366cc' : '#000000';
  const intensity = selected ? 0.35 : hovered ? 0.15 : 0;

  return (
    <group scale={status === 'failed' ? 0.85 : 1}>
      {[0, 0.25, 0.5].map((y, i) => (
        <mesh key={y} castShadow receiveShadow position={[0, 0.35 + y, 0]}>
          <boxGeometry args={[1.1 - i * 0.08, 0.22, 0.8 - i * 0.05]} />
          <meshStandardMaterial
            color={i === 0 ? color : '#475569'}
            emissive={i === 0 ? emissive : '#000000'}
            emissiveIntensity={i === 0 ? intensity : 0}
            metalness={0.35}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
