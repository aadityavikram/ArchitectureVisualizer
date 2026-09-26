import type { NodeGeometryProps } from './types';

export function QueueGeometry({ color, selected, hovered, status }: NodeGeometryProps) {
  const emissive = selected ? '#4488ff' : hovered ? '#3366cc' : '#000000';
  const intensity = selected ? 0.35 : hovered ? 0.15 : 0;

  return (
    <group scale={status === 'failed' ? 0.9 : 1}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.9, 0.7]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={intensity} metalness={0.35} roughness={0.5} />
      </mesh>
      {[-0.35, 0, 0.35].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]}>
          <boxGeometry args={[0.2, 0.15, 0.4]} />
          <meshStandardMaterial color="#e2e8f0" emissive="#bae6fd" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}
