import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ConnectionType } from '../../content/types';
import { colors, timings } from '../../theme';
import type { ResolvedPath } from '../layout';

/**
 * Hoe pakketjes over een pad bewegen:
 * - flow: stromen gewoon door (optioneel trager)
 * - stop: komen tot stopAt (0..1) en verdwijnen daar
 * - fade: worden onderweg steeds kleiner en vallen weg (zwak signaal)
 * - none: er komt niets meer aan
 */
export type PacketBehaviour =
  | { kind: 'flow'; speedFactor?: number; problem?: boolean }
  | { kind: 'stop'; stopAt: number }
  | { kind: 'fade' }
  | { kind: 'none' };

const packetGeometry = new THREE.SphereGeometry(1, 12, 8);
// Wit basismateriaal; de kleur komt per pakketje uit instanceColor.
const packetMaterial = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
const healthy = new THREE.Color(colors.packet);
const problem = new THREE.Color(colors.packetProblem);

type Props = {
  paths: ResolvedPath[];
  behaviours: PacketBehaviour[];
  connectionType: ConnectionType;
  animate: boolean;
};

type Slot = { path: ResolvedPath; behaviour: PacketBehaviour; offset: number; speed: number; size: number; index: number };

/**
 * Oplichtende datapakketjes die over alle actieve verbindingen richting het huis stromen.
 * Eén instanced mesh voor alle pakketjes: één draw call.
 */
export function Packets({ paths, behaviours, connectionType, animate }: Props) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const slots = useMemo<Slot[]>(
    () =>
      paths.flatMap((path, p) => {
        const behaviour = behaviours[p] ?? { kind: 'flow' };
        if (behaviour.kind === 'none') return [];
        const count = Math.max(2, Math.round(path.length / timings.packetSpacing));
        const isCopper = connectionType === 'dsl' && path.cable === 'copper-on-dsl';
        let factor = isCopper ? timings.dslPacketSpeedFactor : 1;
        if (behaviour.kind === 'flow' && behaviour.speedFactor) factor *= behaviour.speedFactor;
        if (behaviour.kind === 'fade') factor *= 0.5;
        const speed = (timings.packetSpeed * factor) / path.length;
        const size = path.medium === 'air' ? 0.06 : path.cable === 'indoor' ? 0.045 : 0.1;
        return Array.from({ length: count }, (_, i) => ({ path, behaviour, offset: i / count, speed, size, index: i }));
      }),
    [paths, behaviours, connectionType],
  );

  const temp = useMemo(
    () => ({ m: new THREE.Matrix4(), p: new THREE.Vector3(), s: new THREE.Vector3(), q: new THREE.Quaternion() }),
    [],
  );

  const place = (time: number) => {
    const instanced = mesh.current;
    if (!instanced) return;
    slots.forEach((slot, i) => {
      const raw = (slot.offset + time * slot.speed) % 1;
      let t = raw;
      // Zacht verschijnen en verdwijnen aan de uiteinden.
      let scale = Math.min(1, Math.sin(Math.PI * raw) * 3);
      const b = slot.behaviour;
      if (b.kind === 'stop') {
        t = raw * b.stopAt;
      } else if (b.kind === 'fade') {
        scale = Math.min(1, raw * 8) * (1 - raw) ** 1.5;
        if (slot.index % 2 === 1 && raw > 0.4) scale = 0; // de helft valt onderweg weg
      }
      slot.path.curve.getPointAt(t, temp.p);
      temp.s.setScalar(slot.size * Math.max(0, scale));
      temp.m.compose(temp.p, temp.q, temp.s);
      instanced.setMatrixAt(i, temp.m);
    });
    instanced.count = slots.length;
    instanced.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    slots.forEach((slot, i) => {
      const b = slot.behaviour;
      const isProblem = b.kind === 'stop' || b.kind === 'fade' || (b.kind === 'flow' && b.problem);
      instanced.setColorAt(i, isProblem ? problem : healthy);
    });
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
    // Bij reduced motion: één keer neerzetten en stilhouden.
    place(0);
  });

  useFrame(({ clock }) => {
    if (animate) place(clock.elapsedTime);
  });

  return (
    <instancedMesh
      // Opnieuw aanmaken als het aantal pakketjes verandert.
      key={slots.length}
      ref={mesh}
      args={[packetGeometry, packetMaterial, Math.max(1, slots.length)]}
      frustumCulled={false}
    />
  );
}
