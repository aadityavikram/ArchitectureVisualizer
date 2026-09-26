import type { NodeGeometryProps } from './types';

export function StorageGeometry({ color, selected, hovered, status }: NodeGeometryProps) {
  const emissive = selected ? '#4488ff' : hovered ? '#3366cc' : '#000000';
  const intensity = selected ? 0.35 : hovered ? 0.15 : 0;

  return (
    <group scale={status === 'failed' ? 0.9 : 1}>
      <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 0.8, 6]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensity} metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.72, 0.72, 0.1, 6]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}
