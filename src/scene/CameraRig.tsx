import { useLayoutEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** Middelpunt en kijkrichting van het overzicht: van voren schuin omlaag, het open huis naar de camera. */
const overviewTarget = new THREE.Vector3(-4, 0.5, -5);
const overviewDirection = new THREE.Vector3(0.38, 0.62, 0.75).normalize();

// Mijlpaal 3/4: vloeiende cameravluchten naar focusNodeId (en harde overgang bij reduced motion).
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const aspect = useThree((s) => s.size.width / s.size.height);

  // Op smalle (staande) schermen verder weg, zodat de hele keten in beeld blijft.
  useLayoutEffect(() => {
    const distance = aspect >= 1.3 ? 34 : 34 * Math.min(1.8, 1.3 / aspect) ** 0.85;
    camera.position.copy(overviewTarget).addScaledVector(overviewDirection, distance);
    camera.lookAt(overviewTarget);
  }, [camera, aspect]);

  return (
    <OrbitControls
      makeDefault
      target={overviewTarget}
      enablePan={false}
      enableDamping
      minDistance={6}
      maxDistance={60}
      minPolarAngle={Math.PI * 0.12}
      maxPolarAngle={Math.PI * 0.42}
    />
  );
}
