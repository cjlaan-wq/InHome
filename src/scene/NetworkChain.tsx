import { useMemo } from 'react';
import { getActiveNodes, getLinks } from '../content';
import { useAppStore } from '../state/store';
import { usePrefersReducedMotion } from '../app/hooks';
import { Hotspots } from './Hotspots';
import { Labels } from './Labels';
import { cableColorKey, decorCables, nodePositions, resolvePaths } from './layout';
import { Cable } from './links/Cable';
import { Packets } from './links/Packets';
import { materials } from './materials';
import { Backbone } from './nodes/Backbone';
import { Devices } from './nodes/Devices';
import { Extender } from './nodes/Extender';
import { House } from './nodes/House';
import { HouseConnection } from './nodes/HouseConnection';
import { KpnCore } from './nodes/KpnCore';
import { Modem } from './nodes/Modem';
import { Neighborhood } from './nodes/Neighborhood';
import { StreetCabinet } from './nodes/StreetCabinet';
import { WifiSignal } from './nodes/WifiSignal';
import * as THREE from 'three';

/** De volledige keten van KPN tot apparaat. */
export function NetworkChain() {
  const connectionType = useAppStore((s) => s.connectionType);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const animate = !usePrefersReducedMotion();

  const nodes = useMemo(() => getActiveNodes(connectionType, hasExtender), [connectionType, hasExtender]);
  const paths = useMemo(
    () =>
      resolvePaths(
        getLinks(connectionType, hasExtender).map((link) => link.id),
        hasExtender,
      ),
    [connectionType, hasExtender],
  );
  const decor = useMemo(() => decorCables.map((points) => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))), []);

  return (
    <group>
      <Neighborhood />
      <KpnCore position={nodePositions['kpn-core']} />
      <Backbone position={nodePositions.backbone} />
      <StreetCabinet position={nodePositions['street-cabinet']} />
      <House />
      <HouseConnection position={nodePositions['house-connection']} type={connectionType} />
      <Modem position={nodePositions.modem} />
      <WifiSignal position={nodePositions.wifi} radius={6.5} animate={animate} />
      {hasExtender && (
        <>
          <Extender position={nodePositions.extender} />
          <WifiSignal position={nodePositions.extender} radius={4} animate={animate} />
        </>
      )}
      <Devices />

      {decor.map((curve, i) => (
        <Cable key={i} curve={curve} material={materials.cable.decor} radius={0.05} />
      ))}
      {paths
        .filter((path) => path.medium === 'cable')
        .map((path) => (
          <Cable
            key={`${path.linkId}-${connectionType}`}
            curve={path.curve}
            material={materials.cable[cableColorKey(path.cable!, connectionType)]}
            radius={path.cable === 'indoor' ? 0.03 : 0.07}
          />
        ))}
      <Packets paths={paths} connectionType={connectionType} animate={animate} />

      <Hotspots activeNodeIds={nodes.map((node) => node.id)} />
      <Labels nodes={nodes} />
    </group>
  );
}
