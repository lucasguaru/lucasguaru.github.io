import { useFrame, useThree } from '@react-three/fiber';
import { MotionValue } from 'framer-motion';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type CameraControllerProps = {
  scrollProgress: MotionValue<number>;
  reducedMotion: boolean;
};

export function CameraController({ scrollProgress, reducedMotion }: CameraControllerProps) {
  const { camera, pointer } = useThree();
  const progress = useRef(0);
  const target = useRef(new THREE.Vector3(0, 1.4, 0));

  useEffect(() => scrollProgress.on('change', (value) => {
    progress.current = value;
  }), [scrollProgress]);

  useFrame((_, delta) => {
    const p = reducedMotion ? 0.18 : progress.current;
    const orbit = p * Math.PI * 1.1;
    const desired = new THREE.Vector3(
      Math.sin(orbit) * 7.2 + pointer.x * 0.45,
      3.2 + p * 6.5 + pointer.y * 0.28,
      15 - p * 18 + Math.cos(orbit) * 1.4
    );

    camera.position.lerp(desired, Math.min(1, delta * 2.1));
    target.current.set(0, 1.2 + p * 2.2, -p * 5.5);
    camera.lookAt(target.current);
  });

  return null;
}
