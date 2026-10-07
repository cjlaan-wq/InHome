import * as THREE from 'three';
import type { ConnectionType, DeviceId, HousePreset, NodeId } from '../content/types';
import type { Coverage } from '../state/coverage';
import {
  connectionSpot,
  deviceOrder,
  deviceSpots,
  extenderSpots,
  floorTop,
  houseSize,
  isCovered,
  modemSpot,
  roomById,
  type HomePlacement,
} from '../state/homeGeometry';

// Ruimtelijke opbouw van de scène. Content (teksten) staat in src/content/;
// hier staat alleen wáár iets staat. De keten loopt van achter-links (ver, KPN)
// naar voor-rechts (dichtbij, je huis). Alles in en rond het huis wordt berekend
// uit 'Jouw huis' (woningtype + in welke kamer alles staat).

export type Vec3 = [number, number, number];

/** Kijkrichting (van doel naar camera): van voren schuin omlaag, het open huis naar de camera. */
export const viewDirection: Vec3 = [0.38, 0.62, 0.75];

/** Lagere kijkrichting van voren, voor onderdelen onder een hogere verdieping. */
const lowDirection: Vec3 = [-0.05, 0.3, 0.95];

/**
 * Camerafocus: waar de camera naar kijkt, hoe ver weg en (optioneel) vanuit welke richting.
 * Zonder richting kijkt de camera vanuit dezelfde hoek als het overzicht.
 */
export type CameraFocus = { target: Vec3; distance: number; direction?: Vec3 };

export const overview: CameraFocus = { target: [-4, 0.5, -5], distance: 34 };

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

// ── Buiten: vast ────────────────────────────────────────────────────────────

const outdoorPositions = {
  'kpn-core': [-17, 0, -15.5],
  backbone: [-10.5, 0, -8.5],
  'street-cabinet': [-4.5, 0, -2.6],
} satisfies Partial<Record<NodeId, Vec3>>;

const outdoorFocus = {
  'kpn-core': { target: [-15.8, 2, -15.3], distance: 15 },
  backbone: { target: [-10.5, 0.3, -8.5], distance: 8 },
  'street-cabinet': { target: [-4.5, 0.8, -2.6], distance: 7 },
} satisfies Partial<Record<NodeId, CameraFocus>>;

const outdoorLabelOffset: Partial<Record<NodeId, Vec3>> = {
  'kpn-core': [0, 4.6, 0],
  backbone: [0, 1.4, 0],
  'street-cabinet': [0, 2.2, 0],
  'house-connection': [-1.1, 0.3, 0.7],
  modem: [0.3, 0.75, 0],
  extender: [0, 0.6, 0],
};

export type Hotspot = {
  nodeId: NodeId;
  partId?: DeviceId;
  /** Welk SuperWifi-punt, bij nodeId 'extender'. */
  extenderIndex?: number;
  center: Vec3;
  size: Vec3;
  floor?: number;
};

const outdoorHotspots: Hotspot[] = [
  { nodeId: 'kpn-core', center: [-16, 1.7, -15.3], size: [6.4, 3.6, 3.4] },
  { nodeId: 'backbone', center: [-10.5, 0.4, -8.5], size: [2.4, 1, 2.2] },
  { nodeId: 'street-cabinet', center: [-4.5, 0.75, -2.6], size: [1.8, 1.6, 1.2] },
];

const outdoorPaths: Record<string, PathSpec[]> = {
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
  [-0.5, -9.5, 0.05, 1],
  [4.5, -10, -0.05, 0.9],
  [9.5, -9.5, 0.05, 1.05],
  [-14, -1, Math.PI / 2, 0.95],
  [-13.5, 4.5, Math.PI / 2, 1],
];

// ── Het huis: berekend ──────────────────────────────────────────────────────

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export type SceneLayout = ReturnType<typeof computeSceneLayout>;

/**
 * Alles wat afhangt van 'Jouw huis': posities, kabels, wifi-paden, camerastandpunten en klikzones.
 * visibleFloor: hogere verdiepingen zijn verborgen (null = alles zichtbaar).
 */
export function computeSceneLayout(
  house: HousePreset,
  placement: HomePlacement,
  hasExtender: boolean,
  coverage: Coverage,
  visibleFloor: number | null,
) {
  const D = house.depth;
  const size = houseSize(house);
  const meterRoom = roomById(house, house.meterRoomId);
  const modemRoom = roomById(house, placement.modemRoomId);
  const extenderRooms = placement.extenderRoomIds.map((id) => roomById(house, id));

  const connection = connectionSpot(house) as Vec3;
  const modem = modemSpot(modemRoom) as Vec3;
  const wifi = add(modem, [0, 0.28, 0]);
  const extenders = extenderSpots(house, placement) as Vec3[];
  const devices = deviceSpots(house, placement) as Record<DeviceId, Vec3>;

  const floorOf = {
    'house-connection': meterRoom.floor,
    modem: modemRoom.floor,
    ...(Object.fromEntries(deviceOrder.map((id) => [id, roomById(house, placement.deviceRooms[id]).floor])) as Record<
      DeviceId,
      number
    >),
  };
  const shown = (floor: number) => visibleFloor === null || floor <= visibleFloor;

  const centroid = deviceOrder
    .map((id) => devices[id])
    .reduce<Vec3>((sum, p) => add(sum, [p[0] / 3, p[1] / 3, p[2] / 3]), [0, 0, 0]);
  const spread = Math.max(...deviceOrder.map((id) => Math.hypot(devices[id][0] - centroid[0], devices[id][2] - centroid[2])));
  const houseCenter: Vec3 = [house.width / 2, Math.min(size.height, (visibleFloor ?? size.floors - 1) * 2.75 + 2.75) / 2, 0];

  const directionFor = (floor: number, p: Vec3) => (isCovered(house, floor, p[0], p[2]) ? lowDirection : undefined);

  const shownExtenders = extenders.map((_, i) => hasExtender && shown(extenderRooms[i].floor));
  const firstExtender = extenders[0] ?? modem;

  const nodePositions: Record<NodeId, Vec3> = {
    ...outdoorPositions,
    'house-connection': connection,
    modem,
    wifi,
    // Het eerste SuperWifi-punt staat model voor 'het SuperWifi-punt' (camera, uitleg).
    extender: firstExtender,
    devices: centroid,
  } as Record<NodeId, Vec3>;

  const labelOffset: Partial<Record<NodeId, Vec3>> = {
    ...outdoorLabelOffset,
    // Wifi-label links naast het huis, ter hoogte van de KPN Box.
    wifi: [-1.8 - modem[0], -0.4, D / 2 - 1 - modem[2]],
  };

  const cameraFocus: Record<NodeId, CameraFocus> = {
    ...outdoorFocus,
    'house-connection': {
      target: add(connection, [0.3, 0, 0]),
      distance: 4.5,
      direction: isCovered(house, meterRoom.floor, connection[0], connection[2]) ? [0.15, 0.3, 0.95] : undefined,
    },
    modem: { target: add(modem, [-0.1, -0.05, 0]), distance: 4.5, direction: directionFor(modemRoom.floor, modem) },
    wifi: { target: houseCenter, distance: 13 + house.width * 0.4 },
    extender:
      extenders.length > 1
        ? { target: houseCenter, distance: 12 + house.width * 0.4 }
        : {
            target: firstExtender,
            distance: 5.5,
            direction: extenderRooms[0] ? directionFor(extenderRooms[0].floor, firstExtender) : undefined,
          },
    devices: { target: centroid, distance: Math.max(10, 8 + spread * 1.4) },
  } as Record<NodeId, CameraFocus>;

  /** Camera bij 'Jouw huis': het hele (zichtbare) huis in beeld. */
  const homeFocus: CameraFocus = { target: houseCenter, distance: 11 + Math.max(house.width, house.depth) * 0.9 };

  const houseHotspots: Hotspot[] = [
    { nodeId: 'house-connection', center: connection, size: [0.5, 0.6, 0.4], floor: meterRoom.floor },
    { nodeId: 'modem', center: modem, size: [0.5, 0.7, 0.6], floor: modemRoom.floor },
    { nodeId: 'wifi', center: add(wifi, labelOffset.wifi!), size: [1.4, 0.8, 1.4] },
    ...extenders.map((center, i) => ({
      nodeId: 'extender' as const,
      extenderIndex: i,
      center,
      size: [0.6, 0.6, 0.6] as Vec3,
      floor: extenderRooms[i].floor,
    })),
    { nodeId: 'devices', partId: 'laptop', center: add(devices.laptop, [0, 0.12, 0]), size: [0.8, 0.5, 0.7], floor: floorOf.laptop },
    { nodeId: 'devices', partId: 'tv', center: devices.tv, size: [1.7, 1.1, 0.4], floor: floorOf.tv },
    { nodeId: 'devices', partId: 'phone', center: devices.phone, size: [0.6, 0.3, 0.6], floor: floorOf.phone },
  ];
  const hotspots = [...outdoorHotspots, ...houseHotspots].filter((spot) => spot.floor === undefined || shown(spot.floor));

  // Kabel van de wijkkast achter het huis langs naar de aansluiting tegen de achtermuur.
  const behind = -D / 2 - 0.6;
  const streetCable: Vec3[] = [
    [-3.9, cableY, -2.6],
    [-2.4, cableY, behind],
    [connection[0], cableY, behind],
    [connection[0], cableY, -D / 2 - 0.05],
    [connection[0], connection[1] - 0.25, -D / 2 + 0.05],
    add(connection, [0, 0, -0.08]),
  ];

  // Binnenkabel: omlaag naar de vloer, langs de achtermuur (en zo nodig in de hoek omhoog) naar de KPN Box.
  const wallZ = -D / 2 + 0.2;
  const meterFloorY = floorTop(meterRoom.floor) + 0.08;
  const modemFloorY = floorTop(modemRoom.floor) + 0.08;
  const indoorCable: Vec3[] = [
    add(connection, [0.1, -0.1, 0]),
    [connection[0] + 0.1, meterFloorY, wallZ],
    ...(modemRoom.floor !== meterRoom.floor
      ? ([
          [0.22, meterFloorY, wallZ],
          [0.22, modemFloorY, wallZ],
        ] as Vec3[])
      : []),
    [modem[0] - 0.15, modemFloorY, wallZ],
    [modem[0] - 0.15, modemFloorY, modem[2]],
    [modem[0] - 0.12, modem[1] - 0.2, modem[2]],
  ];

  // Wifi: elk apparaat krijgt zijn signaal van de beste bron (KPN Box of een SuperWifi-punt);
  // SuperWifi-punten krijgen het hunne van de KPN Box of van een ander punt (mesh).
  const servingExtender = (id: DeviceId) =>
    hasExtender && coverage.devices[id].servedBy === 'extender' ? coverage.devices[id].extenderIndex : undefined;
  const visibleDevices = deviceOrder.filter((id) => shown(floorOf[id]));
  const feedPosition = (index: number) => {
    const feed = coverage.extenderFeeds[index] ?? -1;
    return feed >= 0 ? extenders[feed] : wifi;
  };

  const linkPaths: Record<string, PathSpec[]> = {
    ...outdoorPaths,
    'street-cabinet__house-connection': [{ medium: 'cable', cable: 'copper-on-dsl', points: streetCable }],
    'house-connection__modem': [{ medium: 'cable', cable: 'indoor', points: indoorCable }],
    wifi__devices: visibleDevices
      .filter((id) => servingExtender(id) === undefined)
      .map((id) => ({ medium: 'air' as const, from: wifi, to: devices[id], deviceId: id })),
    wifi__extender: extenders
      .map((to, i) => ({ to, i }))
      .filter(({ i }) => shownExtenders[i])
      .map(({ to, i }) => ({ medium: 'air' as const, from: feedPosition(i), to })),
    extender__devices: visibleDevices
      .filter((id) => servingExtender(id) !== undefined)
      .map((id) => ({ medium: 'air' as const, from: extenders[servingExtender(id)!], to: devices[id], deviceId: id })),
  };

  return {
    house,
    nodePositions,
    devicePositions: devices,
    extenderPositions: extenders,
    shownExtenders,
    labelOffset,
    cameraFocus,
    homeFocus,
    hotspots,
    linkPaths,
    floorOf,
    shown,
    visibleFloor,
  };
}

// ── Paden ───────────────────────────────────────────────────────────────────

export type ResolvedPath = {
  linkId: string;
  medium: PathSpec['medium'];
  cable?: CablePath['cable'];
  deviceId?: DeviceId;
  curve: THREE.Curve<THREE.Vector3>;
  length: number;
};

const toVec = (v: Vec3) => new THREE.Vector3(...v);

/** Kabels als rechte stukken met hoeken (zoals een echte kabel langs muren), wifi als boog door de lucht. */
const buildCurve = (spec: PathSpec): THREE.Curve<THREE.Vector3> => {
  if (spec.medium === 'cable') {
    if (spec.cable !== 'indoor' && spec.points.length <= 4)
      return new THREE.CatmullRomCurve3(spec.points.map(toVec), false, 'centripetal');
    const path = new THREE.CurvePath<THREE.Vector3>();
    spec.points.slice(1).forEach((point, i) => {
      const from = toVec(spec.points[i]);
      const to = toVec(point);
      if (from.distanceTo(to) > 0.001) path.add(new THREE.LineCurve3(from, to));
    });
    return path;
  }
  const from = toVec(spec.from);
  const to = toVec(spec.to);
  const control = from.clone().lerp(to, 0.5);
  control.y += 0.8 + from.distanceTo(to) * 0.12;
  return new THREE.QuadraticBezierCurve3(from, control, to);
};

/** Alle actieve paden voor de huidige situatie. */
export const resolvePaths = (linkPaths: Record<string, PathSpec[]>, activeLinkIds: string[]): ResolvedPath[] =>
  activeLinkIds.flatMap((linkId) =>
    (linkPaths[linkId] ?? []).map((spec) => {
      const curve = buildCurve(spec);
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
