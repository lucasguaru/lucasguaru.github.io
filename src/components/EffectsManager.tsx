import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';

type EffectsManagerProps = {
  disabled?: boolean;
};

export function EffectsManager({ disabled = false }: EffectsManagerProps) {
  if (disabled) return null;

  return (
    <EffectComposer>
      <Bloom intensity={0.95} luminanceThreshold={0.28} luminanceSmoothing={0.62} mipmapBlur />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={new Vector2(0.0008, 0.0005)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.18} darkness={0.72} />
    </EffectComposer>
  );
}
