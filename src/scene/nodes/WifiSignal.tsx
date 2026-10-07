import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colors, timings } from '../../theme';
import type { Vec3 } from '../layout';

const ringCount = 3;
const ringGeometry = new THREE.RingGeometry(0.97, 1, 64).rotateX(-Math.PI / 2);
const volumeGeometry = new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);

type Props = {
  position: Vec3;
  /** Bereik in scène-eenheden. */
  radius: number;
  animate: boolean;
};

/** Wifi als zacht uitdijende ringen plus een vage koepel die het bereik laat zien. */
export function WifiSignal({ position, radius, animate }: Props) {
  const rings = useRef<THREE.Mesh[]>([]);
  const ringMaterials = useMemo(
    () =>
      Array.from(
        { length: ringCount },
        () =>
          new THREE.MeshBasicMaterial({
            color: colors.wifiRing,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
      ),
    [],
  );
  const volumeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: colors.wifiRing,
        transparent: true,
        opacity: 0.02,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const place = (time: number) => {
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const progress = animate ? (time / timings.wifiPulse + i / ringCount) % 1 : (i + 1) / (ringCount + 1);
      const scale = 0.3 + progress * (radius - 0.3);
      ring.scale.set(scale, 1, scale);
      ringMaterials[i].opacity = 0.55 * (1 - progress) ** 1.5;
    });
  };

  useFrame(({ clock }) => place(clock.elapsedTime));

  return (
    <group position={position}>
      {ringMaterials.map((material, i) => (
        <mesh
          key={i}
          ref={(mesh) => {
            if (mesh) rings.current[i] = mesh;
          }}
          geometry={ringGeometry}
          material={material}
          renderOrder={2}
        />
      ))}
      <mesh geometry={volumeGeometry} material={volumeMaterial} scale={radius} renderOrder={1} />
    </group>
  );
}
