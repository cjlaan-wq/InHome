import { OrbitControls } from '@react-three/drei';

// Mijlpaal 1: vrije camerabesturing binnen rustige grenzen.
// Mijlpaal 3/4: vloeiende cameravluchten naar focusNodeId (en harde overgang bij reduced motion).
export function CameraRig() {
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping
      minDistance={6}
      maxDistance={30}
      minPolarAngle={Math.PI * 0.15}
      maxPolarAngle={Math.PI * 0.45}
    />
  );
}
