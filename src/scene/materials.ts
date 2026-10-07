import * as THREE from 'three';
import { colors } from '../theme';

// Gedeelde geometrie en materialen: één keer aanmaken, overal hergebruiken.
// Onderdelen schalen een eenheidsvorm in plaats van eigen geometrie te maken.

export const geometries = {
  box: new THREE.BoxGeometry(1, 1, 1),
  cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 24),
  sphere: new THREE.SphereGeometry(0.5, 16, 12),
};

const standard = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...extra });

export const materials = {
  building: standard(colors.building),
  buildingShade: standard(colors.buildingShade),
  wall: standard(colors.wall),
  floor: standard(colors.floor),
  roof: standard(colors.roof),
  cabinet: standard(colors.cabinet, { roughness: 0.6 }),
  furniture: standard(colors.furniture),
  fabric: standard(colors.fabric),
  grass: standard(colors.grass),
  plant: standard(colors.plant),
  device: standard(colors.device, { roughness: 0.4 }),
  screen: standard(colors.screen, { roughness: 0.25, emissive: colors.screen, emissiveIntensity: 0.25 }),
  groundPath: standard(colors.groundPath),
  glass: standard(colors.building, { transparent: true, opacity: 0.35, roughness: 0.1 }),
  led: new THREE.MeshBasicMaterial({ color: colors.ledOn, toneMapped: false }),
  accent: standard(colors.kpnGreen, { roughness: 0.5 }),
  cable: {
    fiber: standard(colors.fiberCable, { roughness: 0.5, emissive: colors.fiberCable, emissiveIntensity: 0.15 }),
    copper: standard(colors.copperCable, { roughness: 0.5 }),
    indoor: standard(colors.indoorCable, { roughness: 0.5 }),
    decor: standard(colors.dimmed, { roughness: 0.6 }),
  },
};
