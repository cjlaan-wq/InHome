import { Canvas } from '@react-three/fiber';
import { colors } from '../theme';
import { t } from '../i18n';
import { usePageVisible } from '../app/hooks';
import { CameraRig } from './CameraRig';
import { Lights } from './Lights';

// Lazy geladen vanuit de app-shell, zodat het tekstpaneel direct zichtbaar is.
export default function Scene() {
  const visible = usePageVisible();

  return (
    <Canvas
      // Alleen renderen als er iets verandert; volledig stoppen als het tabblad verborgen is.
      frameloop={visible ? 'demand' : 'never'}
      dpr={[1, 2]}
      camera={{ position: [0, 9, 16], fov: 40 }}
      aria-label={t('scene.ariaLabel')}
      role="img"
    >
      <color attach="background" args={[colors.sceneBackground]} />
      <Lights />
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <circleGeometry args={[18, 48]} />
        <meshStandardMaterial color={colors.ground} />
      </mesh>
      <CameraRig />
    </Canvas>
  );
}
