import { Line, RoundedBox, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { GlassMaterial } from './GlassMaterial';

const towers = [
  { label: 'API Gateway', position: [-4.2, 1.5, -1.2], height: 3.0, color: '#7cecff' },
  { label: 'Event Mesh', position: [-1.35, 2.3, -3.2], height: 4.6, color: '#2af6ae' },
  { label: 'Retry Loop', position: [1.8, 1.8, -1.0], height: 3.6, color: '#ffbd66' },
  { label: 'Observability', position: [4.3, 2.65, -3.9], height: 5.3, color: '#c7f7ff' },
  { label: 'Queues', position: [0, 1.25, 1.9], height: 2.5, color: '#63f0d2' }
] as const;

function Tower({ label, position, height, color }: (typeof towers)[number]) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const pulse = Math.sin(state.clock.elapsedTime * 1.4 + position[0]) * 0.08;
    mesh.current.scale.y = 1 + pulse;
  });

  return (
    <group position={position}>
      <RoundedBox ref={mesh} args={[1.05, height, 1.05]} radius={0.05} smoothness={4} position={[0, 0, 0]}>
        <GlassMaterial color={color} opacity={0.28} />
      </RoundedBox>
      <mesh position={[0, height / 2 + 0.08, 0]}>
        <boxGeometry args={[1.18, 0.08, 1.18]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.4} />
      </mesh>
      <Text
        position={[0, height / 2 + 0.55, 0.05]}
        fontSize={0.18}
        color="#ecfdff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {label}
      </Text>
    </group>
  );
}

function EventPulse({ start, end, color, offset }: { start: THREE.Vector3; end: THREE.Vector3; color: string; offset: number }) {
  const pulse = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!pulse.current) return;
    const t = (Math.sin(state.clock.elapsedTime * 1.2 + offset) + 1) / 2;
    pulse.current.position.lerpVectors(start, end, t);
  });

  return (
    <mesh ref={pulse}>
      <sphereGeometry args={[0.09, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.8} />
    </mesh>
  );
}

export function SystemCity() {
  const paths = useMemo(() => {
    const points = towers.map((tower) => new THREE.Vector3(tower.position[0], tower.height + 0.45, tower.position[2]));
    return [
      [points[0], points[1], '#7cecff'],
      [points[1], points[2], '#2af6ae'],
      [points[2], points[3], '#ffbd66'],
      [points[4], points[0], '#63f0d2'],
      [points[4], points[3], '#c7f7ff']
    ] as const;
  }, []);

  return (
    <group position={[1.1, -0.4, 0]} rotation={[0, -0.26, 0]}>
      <group>
        {towers.map((tower) => (
          <Tower key={tower.label} {...tower} />
        ))}
      </group>

      {paths.map(([start, end, color], index) => (
        <group key={`${start.x}-${end.x}`}>
          <Line points={[start, end]} color={color} lineWidth={1.2} transparent opacity={0.72} />
          <EventPulse start={start} end={end} color={color} offset={index} />
        </group>
      ))}

      {[-5.5, -2.75, 0, 2.75, 5.5].map((x) => (
        <Line
          key={x}
          points={[
            [x, 0.04, 4.8],
            [x, 0.04, -8.8]
          ]}
          color="#163941"
          lineWidth={0.7}
          transparent
          opacity={0.7}
        />
      ))}
    </group>
  );
}
