import { useLayoutEffect, useMemo, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAppStore } from '../state/store';
import { usePrefersReducedMotion } from '../app/hooks';
import { timings } from '../theme';
import { overview, viewDirection, type CameraFocus, type SceneLayout } from './layout';

const direction = new THREE.Vector3(...viewDirection).normalize();
const up = new THREE.Vector3(0, 1, 0);

/** Rustige zwaai in het overzicht: amplitude (rad) en snelheid. */
const sway = { amplitude: 0.14, speed: 0.13, idleDelay: 4 };

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

type Flight = {
  fromPosition: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toPosition: THREE.Vector3;
  toTarget: THREE.Vector3;
  progress: number;
};

/**
 * Camera: vliegt in ≈1 s naar het gekozen onderdeel (of terug naar het overzicht),
 * meestal vanuit dezelfde kijkrichting als het overzicht, zodat je nooit gedesoriënteerd raakt.
 * Bij reduced motion: harde overgang en geen zwaai.
 */
export function CameraRig({ layout }: { layout: SceneLayout }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const flight = useRef<Flight | null>(null);
  const lastInteraction = useRef(-Infinity);
  const placed = useRef(false);

  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  const clock = useThree((s) => s.clock);
  const aspect = useThree((s) => s.size.width / s.size.height);
  const focusNodeId = useAppStore((s) => s.focusNodeId);
  const homeMode = useAppStore((s) => s.mode === 'home');
  const reducedMotion = usePrefersReducedMotion();

  const focus: CameraFocus = homeMode
    ? layout.homeFocus
    : focusNodeId
      ? layout.cameraFocus[focusNodeId]
      : overview;
  // Alleen opnieuw vliegen als het doel echt verandert (niet bij elke herberekening van de layout).
  const focusKey = JSON.stringify(focus);

  const goal = useMemo(() => {
    const focus = JSON.parse(focusKey) as CameraFocus;
    // Op smalle (staande) schermen verder weg, zodat alles in beeld blijft.
    const scale = aspect >= 1.3 ? 1 : Math.min(1.8, 1.3 / aspect) ** 0.85;
    const target = new THREE.Vector3(...focus.target);
    const dir = focus.direction ? new THREE.Vector3(...focus.direction).normalize() : direction;
    return { target, position: target.clone().addScaledVector(dir, focus.distance * scale) };
  }, [focusKey, aspect]);

  useLayoutEffect(() => {
    const c = controls.current;
    if (!c) return;
    if (!placed.current || reducedMotion) {
      placed.current = true;
      flight.current = null;
      camera.position.copy(goal.position);
      c.target.copy(goal.target);
      c.update();
      invalidate();
      return;
    }
    flight.current = {
      fromPosition: camera.position.clone(),
      fromTarget: c.target.clone(),
      toPosition: goal.position,
      toTarget: goal.target,
      progress: 0,
    };
  }, [goal, camera, invalidate, reducedMotion]);

  useFrame((state, delta) => {
    const c = controls.current;
    if (!c) return;
    const f = flight.current;
    if (f) {
      f.progress = Math.min(1, f.progress + delta / timings.cameraFlight);
      const e = easeInOutCubic(f.progress);
      camera.position.lerpVectors(f.fromPosition, f.toPosition, e);
      c.target.lerpVectors(f.fromTarget, f.toTarget, e);
      c.update();
      if (f.progress >= 1) {
        flight.current = null;
        lastInteraction.current = state.clock.elapsedTime;
      }
      return;
    }
    // Rustige zwaai rond het overzicht zolang niemand de camera aanraakt.
    if (!reducedMotion && !focusNodeId && !homeMode && state.clock.elapsedTime - lastInteraction.current > sway.idleDelay) {
      const angle = sway.amplitude * sway.speed * Math.cos(state.clock.elapsedTime * sway.speed) * delta;
      camera.position.sub(c.target).applyAxisAngle(up, angle).add(c.target);
      c.update();
    }
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      minDistance={2.5}
      maxDistance={70}
      minPolarAngle={Math.PI * 0.12}
      maxPolarAngle={Math.PI * 0.42}
      onStart={() => {
        // De gebruiker neemt het over: vlucht en zwaai stoppen.
        flight.current = null;
        lastInteraction.current = Infinity;
      }}
      onEnd={() => {
        lastInteraction.current = clock.elapsedTime;
      }}
    />
  );
}
