import { Instance, Instances } from '@react-three/drei';
import type { HousePreset, Room } from '../../content/types';
import { floorHeight, floorPitch, floorTop, slab } from '../../state/homeGeometry';
import { geometries, materials } from '../materials';
import { Block, Cylinder } from '../primitives';

const wall = 0.15;
/** Binnenmuren zijn laag (poppenhuis), zodat je van bovenaf in alle kamers kijkt. */
const innerWallHeight = 1.1;
const doorWidth = 0.9;

type Props = { house: HousePreset; visibleFloor: number | null };

/**
 * Opengewerkt huis, opgebouwd uit de kamers van het woningtype: vloeren, achter- en
 * linkermuur, lage binnenmuren met deuropeningen, trappen en meubels per soort kamer.
 * Voor- en rechterkant zijn weggesneden; lage randjes laten de vorm van het huis zien.
 */
export function House({ house, visibleFloor }: Props) {
  const rooms = house.rooms.filter((room) => visibleFloor === null || room.floor <= visibleFloor);
  const stairs = house.stairs.filter((s) => visibleFloor === null || s.floor <= visibleFloor);
  const neighbours = (room: Room) => rooms.filter((other) => other.floor === room.floor && other !== room);

  return (
    <group>
      {rooms.map((room) => (
        <RoomShell key={room.id} room={room} house={house} neighbours={neighbours(room)} />
      ))}
      {stairs.map((s) => {
        const steps = 8;
        const run = (s.zTo - s.zFrom) / steps;
        return (
          <Instances key={`${s.floor}-${s.x}`} geometry={geometries.box} material={materials.furniture} limit={steps}>
            {Array.from({ length: steps }, (_, i) => {
              const height = floorPitch * ((i + 1) / steps);
              return (
                <Instance
                  key={i}
                  position={[s.x, floorTop(s.floor) + height / 2, s.zFrom + run * (i + 0.5)]}
                  scale={[s.width, height, Math.abs(run)]}
                />
              );
            })}
          </Instances>
        );
      })}
    </group>
  );
}

/** Stukken muur langs [a, b] met een deuropening in het midden (als er ruimte voor is). */
const withDoor = (a: number, b: number): [number, number][] => {
  const mid = (a + b) / 2;
  return b - a > doorWidth + 0.8 ? [[a, mid - doorWidth / 2], [mid + doorWidth / 2, b]] : [];
};

const overlap = (a1: number, a2: number, b1: number, b2: number): [number, number] | null => {
  const from = Math.max(a1, b1);
  const to = Math.min(a2, b2);
  return to - from > 0.01 ? [from, to] : null;
};

function RoomShell({ room, house, neighbours }: { room: Room; house: HousePreset; neighbours: Room[] }) {
  if (room.kind === 'garden') return <Garden room={room} house={house} />;
  const y = floorTop(room.floor);
  const { x, z, width: w, depth: d } = room;
  const right = x + w;
  const front = z + d;
  const upper = room.floor > 0;

  // Binnenmuren: alleen aan de rechter- en voorkant, zodat elke gedeelde muur één keer getekend wordt.
  const rightWalls = neighbours
    .filter((n) => Math.abs(n.x - right) < 0.01)
    .flatMap((n) => {
      const span = overlap(z, front, n.z, n.z + n.depth);
      return span ? withDoor(...span) : [];
    });
  const frontWalls = neighbours
    .filter((n) => Math.abs(n.z - front) < 0.01)
    .flatMap((n) => {
      const span = overlap(x, right, n.x, n.x + n.width);
      return span ? withDoor(...span) : [];
    });
  const openFront = !neighbours.some((n) => Math.abs(n.z - front) < 0.01);
  const outerRight = Math.abs(right - house.width) < 0.01;
  const outerHeight = floorHeight + slab;

  return (
    <group>
      {/* Vloer */}
      <Block position={[x + w / 2, y - slab / 2, z + d / 2]} size={[w, slab, d]} material={materials.floor} />

      {/* Buitenmuren achter en links: volle hoogte */}
      {Math.abs(z + house.depth / 2) < 0.01 && (
        <Block position={[x + w / 2, y - slab + outerHeight / 2, z + wall / 2]} size={[w, outerHeight, wall]} material={materials.wall} />
      )}
      {x < 0.01 && (
        <Block position={[wall / 2, y - slab + outerHeight / 2, z + d / 2]} size={[wall, outerHeight, d]} material={materials.wall} />
      )}

      {/* Lage binnenmuren met deuropening */}
      {rightWalls.map(([a, b]) => (
        <Block key={`r${a}`} position={[right, y + innerWallHeight / 2, (a + b) / 2]} size={[0.1, innerWallHeight, b - a]} material={materials.wall} />
      ))}
      {frontWalls.map(([a, b]) => (
        <Block key={`f${a}`} position={[(a + b) / 2, y + innerWallHeight / 2, front]} size={[b - a, innerWallHeight, 0.1]} material={materials.wall} />
      ))}

      {/* Weggesneden buitenkant: laag randje beneden, glazen balustrade boven */}
      {openFront &&
        (upper ? (
          <Block position={[x + w / 2, y + 0.45, front - 0.03]} size={[w, 0.9, 0.06]} material={materials.glass} />
        ) : (
          <Block position={[x + w / 2, y + 0.1, front - wall / 2]} size={[w, 0.3, wall]} material={materials.buildingShade} />
        ))}
      {outerRight && (
        <Block position={[right - wall / 2, y + 0.1, z + d / 2]} size={[wall, 0.3, d]} material={materials.buildingShade} />
      )}

      <Furniture room={room} />
    </group>
  );
}

/** Tuin of balkon: gras, een laag hekje aan de buitenkant en wat groen. */
function Garden({ room, house }: { room: Room; house: HousePreset }) {
  const y = floorTop(room.floor);
  const { x, z, width: w, depth: d } = room;
  const fence = 0.06;
  return (
    <group>
      <Block position={[x + w / 2, y - slab / 2, z + d / 2]} size={[w, slab, d]} material={materials.grass} />
      <Block position={[x + w / 2, y + 0.2, z + d - fence / 2]} size={[w, 0.4, fence]} material={materials.buildingShade} />
      {Math.abs(x + w - house.width) < 0.01 && (
        <Block position={[x + w - fence / 2, y + 0.2, z + d / 2]} size={[fence, 0.4, d]} material={materials.buildingShade} />
      )}
      {x < 0.01 && <Block position={[fence / 2, y + 0.2, z + d / 2]} size={[fence, 0.4, d]} material={materials.buildingShade} />}
      {d > 2 && (
        <>
          <Cylinder position={[x + w - 0.7, y + 0.35, z + d - 0.7]} size={[0.8, 0.7, 0.8]} material={materials.plant} />
          <Cylinder position={[x + w - 1.6, y + 0.25, z + d - 0.6]} size={[0.6, 0.5, 0.6]} material={materials.plant} />
        </>
      )}
    </group>
  );
}

/** Meubels per soort kamer, aan de rechterkant/achterin (de linkerkant is vrij voor KPN Box en apparaten). */
function Furniture({ room }: { room: Room }) {
  const y = floorTop(room.floor);
  const { x, z, width: w, depth: d } = room;
  switch (room.kind) {
    case 'living': {
      const length = Math.min(2.2, d * 0.5);
      return (
        <>
          <Block position={[x + w - 0.6, y + 0.25, z + d * 0.45]} size={[0.8, 0.5, length]} material={materials.fabric} />
          <Block position={[x + w - 0.25, y + 0.55, z + d * 0.45]} size={[0.18, 0.6, length]} material={materials.fabric} />
        </>
      );
    }
    case 'bedroom':
    case 'attic': {
      const bedDepth = Math.min(1.9, d - 0.35);
      return (
        <>
          <Block position={[x + w - 0.8, y + 0.2, z + 0.15 + bedDepth / 2]} size={[1.3, 0.4, bedDepth]} material={materials.building} />
          <Block position={[x + w - 0.8, y + 0.43, z + 0.25 + bedDepth / 2]} size={[1.3, 0.06, bedDepth - 0.2]} material={materials.fabric} />
          <Block position={[x + w - 0.8, y + 0.5, z + 0.35]} size={[1, 0.12, 0.3]} material={materials.building} />
          {room.kind === 'attic' && (
            <>
              <Block position={[x + w - 2.1, y + 0.25, z + 0.45]} size={[0.5, 0.5, 0.5]} material={materials.furniture} />
              <Block position={[x + w - 2.7, y + 0.2, z + 0.4]} size={[0.4, 0.4, 0.4]} material={materials.furniture} />
            </>
          )}
        </>
      );
    }
    case 'office':
      return <Block position={[x + w - 0.35, y + 0.375, z + d * 0.45]} size={[0.6, 0.75, Math.min(1.4, d * 0.6)]} material={materials.furniture} />;
    case 'kitchen':
      return <Block position={[x + w - 0.35, y + 0.45, z + d / 2]} size={[0.6, 0.9, d * 0.7]} material={materials.furniture} />;
    default:
      return null;
  }
}
