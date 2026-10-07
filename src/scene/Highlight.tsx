import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Status } from '../state/issueStatus';
import { colors, timings } from '../theme';

export type { Status };

const dimTarget = new THREE.Color(colors.dimmedSurface);
const warning = new THREE.Color(colors.warning);
const cache = new Map<string, THREE.Material>();
/** Alle 'betrokken' materialen; ze pulseren samen. */
const pulsing = new Set<THREE.MeshStandardMaterial>();
const restIntensity = 0.35;

/** Gedimde of betrokken variant van een gedeeld materiaal (één keer aangemaakt, daarna hergebruikt). */
export function variant(base: THREE.Material, status: Status): THREE.Material {
  if (status === 'normal') return base;
  const key = `${base.uuid}:${status}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const material = base.clone();
  const color = (material as THREE.Material & { color?: THREE.Color }).color;
  if (color) color.lerp(status === 'dimmed' ? dimTarget : warning, status === 'dimmed' ? 0.7 : 0.85);
  if (material instanceof THREE.MeshStandardMaterial) {
    if (status === 'dimmed') {
      material.emissive.set(0x000000);
    } else {
      material.emissive.copy(warning);
      material.emissiveIntensity = restIntensity;
      pulsing.add(material);
    }
  }
  cache.set(key, material);
  return material;
}

/**
 * Zet alle meshes binnen deze groep op de variant voor de status. Zo hoeven de
 * onderdelen zelf (en later .glb-modellen) niets van uitlichten te weten.
 */
export function Highlight({ status, children }: { status: Status; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((s) => s.invalidate);

  // Bewust zonder deps: ook nieuw gemounte kinderen (bijv. FTU ↔ wandcontactdoos) krijgen de juiste variant.
  useLayoutEffect(() => {
    group.current?.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || Array.isArray(mesh.material)) return;
      mesh.userData.baseMaterial ??= mesh.material;
      mesh.material = variant(mesh.userData.baseMaterial as THREE.Material, status);
    });
    invalidate();
  });

  return <group ref={group}>{children}</group>;
}

/** Laat betrokken onderdelen rustig pulseren. Bij reduced motion: vaste gloed. */
export function IssuePulse({ animate }: { animate: boolean }) {
  useFrame(({ clock }) => {
    const intensity = animate ? restIntensity + 0.3 * Math.sin(clock.elapsedTime * timings.issuePulse) : restIntensity;
    pulsing.forEach((material) => (material.emissiveIntensity = intensity));
  });
  return null;
}
