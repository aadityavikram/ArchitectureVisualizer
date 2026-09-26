import type { NodeGeometryProps } from './types';

export function ServerGeometry({ color, selected, hovered, status, utilizationColor }: NodeGeometryProps) {
  const emissive = selected ? '#4488ff' : hovered ? '#3366cc' : utilizationColor ?? '#000000';
  const intensity = selected ? 0.35 : hovered ? 0.15 : utilizationColor ? 0.25 : 0;
  const yScale = status === 'failed' ? 0.6 : 1;

  return (
    <group scale={[1, yScale, 1]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1.2, 1]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensity} metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.9, 0.08, 0.9]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
      </mesh>
      {[0.35, 0.1, -0.15].map((y) => (
        <mesh key={y} position={[0, y, 0.51]}>
          <circleGeometry args={[0.06, 8]} />
          <meshStandardMaterial color={status === 'failed' ? '#ef4444' : '#22c55e'} emissive={status === 'failed' ? '#ef4444' : '#22c55e'} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}
