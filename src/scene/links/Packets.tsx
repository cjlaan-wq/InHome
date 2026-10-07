import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ConnectionType } from '../../content/types';
import { colors, timings } from '../../theme';
import type { ResolvedPath } from '../layout';

const packetGeometry = new THREE.SphereGeometry(1, 12, 8);
const packetMaterial = new THREE.MeshBasicMaterial({ color: colors.packet, toneMapped: false });

type Props = {
  paths: ResolvedPath[];
  connectionType: ConnectionType;
  animate: boolean;
};

type Slot = { path: ResolvedPath; offset: number; speed: number; size: number };

/**
 * Oplichtende datapakketjes die over alle actieve verbindingen richting het huis stromen.
 * Eén instanced mesh voor alle pakketjes: één draw call.
 */
export function Packets({ paths, connectionType, animate }: Props) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const slots = useMemo<Slot[]>(
    () =>
      paths.flatMap((path) => {
        const count = Math.max(2, Math.round(path.length / timings.packetSpacing));
        const isCopper = connectionType === 'dsl' && path.cable === 'copper-on-dsl';
        const speed = (timings.packetSpeed * (isCopper ? timings.dslPacketSpeedFactor : 1)) / path.length;
        const size = path.medium === 'air' ? 0.06 : 0.1;
        return Array.from({ length: count }, (_, i) => ({ path, offset: i / count, speed, size }));
      }),
    [paths, connectionType],
  );

  const temp = useMemo(() => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), s: new THREE.Vector3(), q: new THREE.Quaternion() }), []);

  const place = (time: number) => {
    const instanced = mesh.current;
    if (!instanced) return;
    slots.forEach((slot, i) => {
      const t = (slot.offset + time * slot.speed) % 1;
      slot.path.curve.getPointAt(t, temp.p);
      // Zacht verschijnen en verdwijnen aan de uiteinden.
      const fade = Math.min(1, Math.sin(Math.PI * t) * 3);
      temp.s.setScalar(slot.size * fade);
      temp.m.compose(temp.p, temp.q, temp.s);
      instanced.setMatrixAt(i, temp.m);
    });
    instanced.count = slots.length;
    instanced.instanceMatrix.needsUpdate = true;
  };

  // Bij reduced motion: één keer neerzetten en stilhouden.
  useLayoutEffect(() => place(0));
  useFrame(({ clock }) => {
    if (animate) place(clock.elapsedTime);
  });

  return (
    <instancedMesh
      // Opnieuw aanmaken als het aantal pakketjes verandert.
      key={slots.length}
      ref={mesh}
      args={[packetGeometry, packetMaterial, slots.length]}
      frustumCulled={false}
    />
  );
}
