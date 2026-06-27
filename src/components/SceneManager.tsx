import { Canvas } from '@react-three/fiber';
import { Float, Html, PerspectiveCamera } from '@react-three/drei';
import { MotionValue } from 'framer-motion';
import { Suspense } from 'react';
import { CameraController } from './CameraController';
import { EffectsManager } from './EffectsManager';
import { GlassMaterial } from './GlassMaterial';
import { LightingManager } from './LightingManager';
import { ParticleSystem } from './ParticleSystem';
import { SystemCity } from './SystemCity';

type SceneManagerProps = {
  reducedMotion: boolean;
  scrollProgress: MotionValue<number>;
};

export function SceneManager({ reducedMotion, scrollProgress }: SceneManagerProps) {
  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas gl={{ antialias: true, alpha: true }} dpr={[1, 1.8]}>
        <color attach="background" args={['#05070a']} />
        <fog attach="fog" args={['#05070a', 14, 48]} />
        <PerspectiveCamera makeDefault position={[0, 3.4, 15]} fov={43} />
        <Suspense fallback={<Html center>Loading system map</Html>}>
          <LightingManager />
          <CameraController scrollProgress={scrollProgress} reducedMotion={reducedMotion} />
          <ParticleSystem count={reducedMotion ? 500 : 1500} reducedMotion={reducedMotion} />
          <Float speed={reducedMotion ? 0 : 0.8} rotationIntensity={0.08} floatIntensity={0.35}>
            <SystemCity />
          </Float>
          <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[42, 42, 42, 42]} />
            <GlassMaterial color="#0a1417" opacity={0.32} roughness={0.28} metalness={0.1} />
          </mesh>
          <EffectsManager disabled={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}
