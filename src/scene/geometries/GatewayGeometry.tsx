import type { NodeGeometryProps } from './types';

export function GatewayGeometry({ color, selected, hovered, status }: NodeGeometryProps) {
  const emissive = selected ? '#4488ff' : hovered ? '#3366cc' : '#000000';
  const intensity = selected ? 0.35 : hovered ? 0.15 : 0;

  return (
    <group scale={status === 'failed' ? 0.9 : 1}>
      <mesh castShadow receiveShadow rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[1.1, 1.1, 1.1]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensity} metalness={0.45} roughness={0.4} wireframe={false} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[0.75, 0.06, 8, 4]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}
