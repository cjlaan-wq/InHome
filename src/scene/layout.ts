import * as THREE from 'three';
import type { ConnectionType, DeviceId, NodeId } from '../content/types';

// Ruimtelijke opbouw van de scène. Content (teksten) staat in src/content/;
// hier staat alleen wáár iets staat. De keten loopt van achter-links (ver, KPN)
// naar voor-rechts (dichtbij, je huis).

export type Vec3 = [number, number, number];

/** Huis: footprint x 0..8, z -3..3. Begane grond tot y 2.6, verdieping daarboven. */
export const house = {
  width: 8,
  depth: 6,
  floorHeight: 2.6,
  slab: 0.15,
  wall: 0.15,
  /** Binnenmuur tussen hal en woonkamer / overloop en slaapkamer. */
  innerWallX: 3,
  /** De verdieping ligt alleen achterin, zodat je de woonkamer van bovenaf kunt zien. */
  upperFrontZ: -0.2,
  /** Voorkant van het trapgat. */
  stairTopZ: -0.6,
} as const;

const upper = house.floorHeight + house.slab;

export const nodePositions: Record<NodeId, Vec3> = {
  'kpn-core': [-17, 0, -15.5],
  backbone: [-10.5, 0, -8.5],
  'street-cabinet': [-4.5, 0, -2.6],
  'house-connection': [0.2, 0.9, -2.2],
  modem: [1.25, 1.12, -2.45],
  wifi: [1.25, 1.4, -2.45],
  extender: [3.6, upper + 0.2, -2.55],
  devices: [5.5, 1, 0],
};

export const devicePositions: Record<DeviceId, Vec3> = {
  laptop: [5.2, 0.92, 1.9],
  tv: [3.12, 1.4, 0.2],
  phone: [6.4, upper + 0.52, -1.5],
};

/** Waar het label boven een onderdeel zweeft. */
export const labelOffset: Partial<Record<NodeId, Vec3>> = {
  'kpn-core': [0, 4.6, 0],
  backbone: [0, 1.4, 0],
  'street-cabinet': [0, 2.2, 0],
  'house-connection': [-1.7, 0.1, 0.6],
  modem: [0.3, 1.0, 0],
  wifi: [-3.4, -1.1, 3],
  extender: [0, 0.6, 0],
};

/** Labels die ook op een smal scherm zichtbaar blijven; de rest staat in het paneel. */
export const compactLabelNodes: NodeId[] = ['kpn-core', 'backbone', 'street-cabinet', 'modem'];

type CablePath = { medium: 'cable'; points: Vec3[]; cable: 'fiber' | 'copper-on-dsl' | 'indoor' };
type AirPath = { medium: 'air'; from: Vec3; to: Vec3; deviceId?: DeviceId };
export type PathSpec = CablePath | AirPath;

const cableY = 0.06;

export const linkPaths: Record<string, PathSpec[]> = {
  'kpn-core__backbone': [
    {
      medium: 'cable',
      cable: 'fiber',
      points: [
        [-16, cableY, -13.9],
        [-14.2, cableY, -12.4],
        [-12.4, cableY, -9.7],
        [-10.9, cableY, -8.9],
      ],
    },
  ],
  'backbone__street-cabinet': [
    {
      medium: 'cable',
      cable: 'fiber',
      points: [
        [-10.1, cableY, -8.1],
        [-8.5, cableY, -6.6],
        [-6.6, cableY, -3.9],
        [-5.1, cableY, -3],
      ],
    },
  ],
  'street-cabinet__house-connection': [
    {
      medium: 'cable',
      cable: 'copper-on-dsl',
      points: [
        [-3.9, cableY, -2.6],
        [-2, cableY, -2.3],
        [-0.3, cableY, -2.2],
        [0.05, 0.3, -2.2],
        [0.14, 0.88, -2.2],
      ],
    },
  ],
  'house-connection__modem': [
    {
      medium: 'cable',
      cable: 'indoor',
      points: [
        [0.28, 0.85, -2.2],
        [0.5, 0.82, -2.35],
        [0.9, 0.82, -2.5],
        [1.15, 0.9, -2.5],
      ],
    },
  ],
  wifi__devices: [
    { medium: 'air', from: nodePositions.wifi, to: devicePositions.laptop, deviceId: 'laptop' },
    { medium: 'air', from: nodePositions.wifi, to: devicePositions.tv, deviceId: 'tv' },
    { medium: 'air', from: nodePositions.wifi, to: devicePositions.phone, deviceId: 'phone' },
  ],
  wifi__extender: [{ medium: 'air', from: nodePositions.wifi, to: nodePositions.extender }],
  extender__devices: [{ medium: 'air', from: nodePositions.extender, to: devicePositions.phone, deviceId: 'phone' }],
};

/** Extra glasvezelkabels die naar andere wijken lopen (decor, worden niet uitgelicht). */
export const decorCables: Vec3[][] = [
  [
    [-10.5, cableY, -8.5],
    [-14, cableY, -5],
    [-21, cableY, -2.5],
  ],
  [
    [-10.5, cableY, -8.5],
    [-6, cableY, -12],
    [1, cableY, -14],
  ],
];

/** Buurhuizen rond de wijkkast: [x, z, rotatieY, schaal]. */
export const neighborHouses: [number, number, number, number][] = [
  [-0.5, -8.5, 0.05, 1],
  [4.5, -9, -0.05, 0.9],
  [9.5, -8.5, 0.05, 1.05],
  [-14, -1, Math.PI / 2, 0.95],
  [-13.5, 4.5, Math.PI / 2, 1],
];

export type ResolvedPath = {
  linkId: string;
  medium: PathSpec['medium'];
  cable?: CablePath['cable'];
  deviceId?: DeviceId;
  curve: THREE.Curve<THREE.Vector3>;
  length: number;
};

const toVec = (v: Vec3) => new THREE.Vector3(...v);

const buildCurve = (spec: PathSpec): THREE.Curve<THREE.Vector3> => {
  if (spec.medium === 'cable') return new THREE.CatmullRomCurve3(spec.points.map(toVec), false, 'centripetal');
  const from = toVec(spec.from);
  const to = toVec(spec.to);
  const control = from.clone().lerp(to, 0.5);
  control.y += 0.8 + from.distanceTo(to) * 0.12;
  return new THREE.QuadraticBezierCurve3(from, control, to);
};

const curveCache = new Map<PathSpec, THREE.Curve<THREE.Vector3>>();

/** Alle actieve paden voor de huidige situatie. Met een SuperWifi-punt loopt de telefoon via het punt. */
export const resolvePaths = (activeLinkIds: string[], hasExtender: boolean): ResolvedPath[] =>
  activeLinkIds.flatMap((linkId) =>
    (linkPaths[linkId] ?? [])
      .filter((spec) => !(hasExtender && linkId === 'wifi__devices' && spec.medium === 'air' && spec.deviceId === 'phone'))
      .map((spec) => {
        let curve = curveCache.get(spec);
        if (!curve) {
          curve = buildCurve(spec);
          curveCache.set(spec, curve);
        }
        return {
          linkId,
          medium: spec.medium,
          cable: spec.medium === 'cable' ? spec.cable : undefined,
          deviceId: spec.medium === 'air' ? spec.deviceId : undefined,
          curve,
          length: curve.getLength(),
        };
      }),
  );

export const cableColorKey = (cable: CablePath['cable'], type: ConnectionType) =>
  cable === 'fiber' ? 'fiber' : cable === 'indoor' ? 'indoor' : type === 'dsl' ? 'copper' : 'fiber';
