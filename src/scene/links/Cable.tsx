import { useMemo } from 'react';
import * as THREE from 'three';

type Props = {
  curve: THREE.Curve<THREE.Vector3>;
  material: THREE.Material;
  radius?: number;
};

/** Kabel als buis langs een pad. */
export function Cable({ curve, material, radius = 0.07 }: Props) {
  const geometry = useMemo(() => {
    const segments = Math.max(16, Math.round(curve.getLength() * 6));
    return new THREE.TubeGeometry(curve, segments, radius, 8, false);
  }, [curve, radius]);

  return <mesh geometry={geometry} material={material} />;
}
