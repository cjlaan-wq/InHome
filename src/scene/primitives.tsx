import type * as THREE from 'three';
import type { ThreeElements } from '@react-three/fiber';
import { geometries } from './materials';
import type { Vec3 } from './layout';

type ShapeProps = Omit<ThreeElements['mesh'], 'geometry' | 'material' | 'scale' | 'position'> & {
  position?: Vec3;
  size: Vec3;
  material: THREE.Material;
};

/** Blok op basis van de gedeelde eenheidskubus. */
export function Block({ size, material, ...props }: ShapeProps) {
  return <mesh geometry={geometries.box} material={material} scale={size} {...props} />;
}

/** Cilinder op basis van de gedeelde eenheidscilinder; size = [diameter, hoogte, diameter]. */
export function Cylinder({ size, material, ...props }: ShapeProps) {
  return <mesh geometry={geometries.cylinder} material={material} scale={size} {...props} />;
}
