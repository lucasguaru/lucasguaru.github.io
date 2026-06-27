import { Points, PointMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type ParticleSystemProps = {
  count: number;
  reducedMotion: boolean;
};

export function ParticleSystem({ count, reducedMotion }: ParticleSystemProps) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 6 + Math.random() * 16;
      const angle = Math.random() * Math.PI * 2;
      data[i * 3] = Math.cos(angle) * radius;
      data[i * 3 + 1] = Math.random() * 12 - 1;
      data[i * 3 + 2] = Math.sin(angle) * radius - 8;
    }
    return data;
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current || reducedMotion) return;
    ref.current.rotation.y += delta * 0.025;
    ref.current.rotation.x = Math.sin(Date.now() * 0.00012) * 0.05;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#8ee8ff" size={0.035} sizeAttenuation depthWrite={false} opacity={0.42} />
    </Points>
  );
}
