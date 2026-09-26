import type { NodeGeometryProps } from './types';

export function NetworkGeometry({ color, selected, hovered, status }: NodeGeometryProps) {
  const emissive = selected ? '#4488ff' : hovered ? '#3366cc' : '#000000';
  const intensity = selected ? 0.35 : hovered ? 0.15 : 0;

  return (
    <group scale={status === 'failed' ? 0.9 : 1}>
      <mesh castShadow receiveShadow>
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensity} metalness={0.4} roughness={0.45} flatShading />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.95, 0.04, 8, 24]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}
