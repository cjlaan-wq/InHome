import { useRef } from 'react';
import { Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { colors, timings } from '../../theme';
import type { Vec3 } from '../layout';

const ringGeometry = new THREE.RingGeometry(0.16, 0.22, 32);
const dotGeometry = new THREE.CircleGeometry(0.07, 16);
const material = new THREE.MeshBasicMaterial({ color: colors.packetProblem, toneMapped: false, transparent: true });

/** Pulserende ring op de plek waar de pakketjes stranden. */
export function ProblemMarker({ position, scale = 1, animate }: { position: Vec3; scale?: number; animate: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ring.current) return;
    const s = animate ? 1 + 0.35 * (0.5 + 0.5 * Math.sin(clock.elapsedTime * timings.issuePulse)) : 1.2;
    ring.current.scale.setScalar(s);
  });
  return (
    <Billboard position={position} scale={scale}>
      <mesh ref={ring} geometry={ringGeometry} material={material} />
      <mesh geometry={dotGeometry} material={material} />
    </Billboard>
  );
}
