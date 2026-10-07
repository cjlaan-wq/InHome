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

/** Kijkrichting (van doel naar camera): van voren schuin omlaag, het open huis naar de camera. */
export const viewDirection: Vec3 = [0.38, 0.62, 0.75];

/** Lagere kijkrichting door de hal, voor onderdelen onder de overloop. */
const hallDirection: Vec3 = [-0.05, 0.3, 0.95];

/**
 * Camerafocus per onderdeel: waar de camera naar kijkt, hoe ver weg en (optioneel) vanuit welke richting.
 * Zonder richting kijkt de camera vanuit dezelfde hoek als het overzicht.
 */
export type CameraFocus = { target: Vec3; distance: number; direction?: Vec3 };

export const cameraFocus: Record<NodeId, CameraFocus> = {
  'kpn-core': { target: [-15.8, 2, -15.3], distance: 15 },
  backbone: { target: [-10.5, 0.3, -8.5], distance: 8 },
  'street-cabinet': { target: [-4.5, 0.8, -2.6], distance: 7 },
  'house-connection': { target: [0.6, 0.9, -2.2], distance: 4.5, direction: [0.15, 0.3, 0.95] },
  modem: { target: [1.1, 1.05, -2.4], distance: 4.5, direction: hallDirection },
  wifi: { target: [2.2, 1.4, -0.6], distance: 15 },
  extender: { target: [3.8, 3, -2.3], distance: 6 },
  devices: { target: [4.8, 1.8, -0.2], distance: 12 },
};

export const overview = { target: [-4, 0.5, -5] as Vec3, distance: 34 };

/**
 * Onzichtbare klikzones per onderdeel (midden + afmeting). Los van de vormen zelf,
 * zodat kleine onderdelen makkelijk te raken zijn en modellen later te vervangen zijn.
 */
export const hotspots: { nodeId: NodeId; partId?: DeviceId; center: Vec3; size: Vec3 }[] = [
  { nodeId: 'kpn-core', center: [-16, 1.7, -15.3], size: [6.4, 3.6, 3.4] },
  { nodeId: 'backbone', center: [-10.5, 0.4, -8.5], size: [2.4, 1, 2.2] },
  { nodeId: 'street-cabinet', center: [-4.5, 0.75, -2.6], size: [1.8, 1.6, 1.2] },
  { nodeId: 'house-connection', center: [0.3, 0.9, -2.2], size: [0.5, 0.7, 0.6] },
  { nodeId: 'modem', center: [1.25, 1.12, -2.45], size: [0.5, 0.7, 0.6] },
  { nodeId: 'wifi', center: [-2.15, 0.3, 0.55], size: [1.4, 0.8, 1.4] },
  { nodeId: 'extender', center: [3.6, 2.95, -2.55], size: [0.6, 0.6, 0.6] },
  { nodeId: 'devices', partId: 'laptop', center: [5.2, 1.05, 1.9], size: [0.8, 0.5, 0.7] },
  { nodeId: 'devices', partId: 'tv', center: [3.2, 1.4, 0.2], size: [0.4, 1.1, 1.8] },
  { nodeId: 'devices', partId: 'phone', center: [6.4, 3.3, -1.5], size: [0.6, 0.3, 0.6] },
];

/** Labels die ook op een smal scherm zichtbaar blijven; de rest staat in het paneel. */
export const compactLabelNodes: NodeId[] = ['kpn-core', 'backbone', 'street-cabinet', 'modem'];

/** Labelpositie in close-up: vlak bij het onderdeel (de overzichtspositie kan dan buiten beeld vallen). */
export const focusedLabelOffset: Partial<Record<NodeId, Vec3>> = {
  'house-connection': [0, 0.45, 0],
  modem: [0, 0.5, 0],
};

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
