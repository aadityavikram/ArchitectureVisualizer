import type { NodeGeometryProps } from './types';

export function DatabaseGeometry({ color, selected, hovered, status }: NodeGeometryProps) {
  const emissive = selected ? '#4488ff' : hovered ? '#3366cc' : '#000000';
  const intensity = selected ? 0.35 : hovered ? 0.15 : 0;

  return (
    <group scale={status === 'failed' ? 0.9 : 1}>
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 1, 16]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensity} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.1, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.08, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}
