import { Instance, Instances } from '@react-three/drei';
import { house } from '../layout';
import { geometries, materials } from '../materials';
import { Block, Cylinder } from '../primitives';

const { width: W, depth: D, floorHeight: H, slab, wall, innerWallX, upperFrontZ, stairTopZ } = house;
const upper = H + slab;
const totalHeight = upper + H;
const zBack = -D / 2;
const zFront = D / 2;
const stepCount = 8;

/**
 * Opengewerkt huis: achter- en linkermuur staan, voor- en rechterkant zijn weggesneden.
 * Beneden: hal (met meterkast en KPN Box) en woonkamer. Boven, alleen achterin: overloop en slaapkamer.
 */
export function House() {
  return (
    <group>
      {/* Vloeren */}
      <Block position={[W / 2, -slab / 2 + 0.05, 0]} size={[W, slab, D]} material={materials.floor} />
      <Block
        position={[(innerWallX + W) / 2, H + slab / 2, (zBack + upperFrontZ) / 2]}
        size={[W - innerWallX, slab, upperFrontZ - zBack]}
        material={materials.floor}
      />
      <Block
        position={[innerWallX / 2, H + slab / 2, (zBack + stairTopZ) / 2]}
        size={[innerWallX, slab, stairTopZ - zBack]}
        material={materials.floor}
      />

      {/* Buitenmuren (achter en links) */}
      <Block
        position={[W / 2, totalHeight / 2, zBack + wall / 2]}
        size={[W, totalHeight, wall]}
        material={materials.wall}
      />
      <Block position={[wall / 2, totalHeight / 2, 0]} size={[wall, totalHeight, D]} material={materials.wall} />

      {/* Weggesneden muren: lage randjes laten de vorm van het huis zien */}
      <Block position={[W / 2, 0.2, zFront - wall / 2]} size={[W, 0.3, wall]} material={materials.buildingShade} />
      <Block position={[W - wall / 2, 0.2, 0]} size={[wall, 0.3, D]} material={materials.buildingShade} />
      {/* Balustrade langs de voorrand van de verdieping */}
      <Block
        position={[(innerWallX + W) / 2, upper + 0.45, upperFrontZ - wall / 2]}
        size={[W - innerWallX, 0.9, 0.06]}
        material={materials.glass}
      />
      <Block
        position={[W - wall / 2, upper + 0.15, (zBack + upperFrontZ) / 2]}
        size={[wall, 0.3, upperFrontZ - zBack]}
        material={materials.buildingShade}
      />

      {/* Binnenmuren: beneden met deuropening aan de voorkant, boven tot de voorrand */}
      <Block position={[innerWallX, H / 2, (zBack + 1.2) / 2]} size={[0.12, H, 1.2 - zBack]} material={materials.wall} />
      <Block
        position={[innerWallX, upper + H / 2, (zBack + upperFrontZ) / 2]}
        size={[0.12, H, upperFrontZ - zBack]}
        material={materials.wall}
      />

      {/* Trap in de hal */}
      <Instances geometry={geometries.box} material={materials.furniture} limit={stepCount}>
        {Array.from({ length: stepCount }, (_, i) => {
          const top = (H + slab) * ((i + 1) / stepCount);
          return <Instance key={i} position={[2.2, top / 2, 2.4 - 0.4 * i]} scale={[1.2, top, 0.4]} />;
        })}
      </Instances>

      {/* Meterkastkastje onder de KPN Box */}
      <Block position={[1.1, 0.45, -2.5]} size={[1.2, 0.8, 0.6]} material={materials.furniture} />

      {/* Woonkamer: tv-meubel tegen de binnenmuur, bank ertegenover, tafel voorin */}
      <Block position={[3.35, 0.4, 0.2]} size={[0.5, 0.7, 2]} material={materials.furniture} />
      <Block position={[6.9, 0.35, 0.2]} size={[0.8, 0.5, 2.2]} material={materials.fabric} />
      <Block position={[7.25, 0.7, 0.2]} size={[0.18, 0.6, 2.2]} material={materials.fabric} />
      <Block position={[5.2, 0.87, 1.9]} size={[1.4, 0.06, 0.9]} material={materials.furniture} />
      {[
        [4.6, 1.55],
        [5.8, 1.55],
        [4.6, 2.25],
        [5.8, 2.25],
      ].map(([x, z]) => (
        <Cylinder key={`${x}-${z}`} position={[x, 0.46, z]} size={[0.06, 0.82, 0.06]} material={materials.furniture} />
      ))}

      {/* Slaapkamer boven: bed */}
      <Block position={[6.1, upper + 0.22, -1.6]} size={[2.6, 0.44, 1.8]} material={materials.building} />
      <Block position={[6.1, upper + 0.47, -1.6]} size={[2.6, 0.06, 1.8]} material={materials.fabric} />
      <Block position={[5.1, upper + 0.55, -1.6]} size={[0.4, 0.14, 1.3]} material={materials.building} />
      <Block position={[4.75, upper + 0.55, -1.6]} size={[0.1, 1.1, 1.9]} material={materials.furniture} />
    </group>
  );
}
