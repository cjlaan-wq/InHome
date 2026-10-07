import { Canvas } from '@react-three/fiber';
import { colors } from '../theme';
import { usePageVisible, usePrefersReducedMotion } from '../app/hooks';
import { CameraRig } from './CameraRig';
import { Lights } from './Lights';
import { NetworkChain } from './NetworkChain';
import { PerfStats } from './PerfStats';

const showPerf = new URLSearchParams(window.location.search).has('perf');

// Lazy geladen vanuit de app-shell, zodat het tekstpaneel direct zichtbaar is.
export default function Scene() {
  const visible = usePageVisible();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Canvas
      // Verborgen tabblad: niet renderen. Reduced motion: alleen renderen als er iets verandert.
      frameloop={!visible ? 'never' : reducedMotion ? 'demand' : 'always'}
      // Max. 1,75× pixeldichtheid: scherp genoeg, veel lichter voor telefoons met hoge resolutie.
      dpr={[1, 1.75]}
      camera={{ fov: 35, near: 0.5, far: 200 }}
    >
      <color attach="background" args={[colors.sceneBackground]} />
      <fog attach="fog" args={[colors.sceneBackground, 45, 90]} />
      <Lights />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02}>
        <circleGeometry args={[60, 64]} />
        <meshStandardMaterial color={colors.ground} />
      </mesh>
      <NetworkChain />
      <CameraRig />
      {showPerf && <PerfStats />}
    </Canvas>
  );
}
