import { MeshPhysicalMaterialProps } from '@react-three/fiber';

type GlassMaterialProps = MeshPhysicalMaterialProps & {
  color?: string;
  opacity?: number;
};

export function GlassMaterial({ color = '#91f4ff', opacity = 0.38, ...props }: GlassMaterialProps) {
  return (
    <meshPhysicalMaterial
      color={color}
      transparent
      opacity={opacity}
      transmission={0.45}
      thickness={0.8}
      roughness={0.18}
      metalness={0.14}
      clearcoat={0.7}
      clearcoatRoughness={0.18}
      {...props}
    />
  );
}
