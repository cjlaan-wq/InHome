import { useMemo } from 'react';
import * as THREE from 'three';
import { getActiveNodes, getLinks } from '../content';
import { useAppStore } from '../state/store';
import { usePrefersReducedMotion } from '../app/hooks';
import { Highlight, IssuePulse, variant } from './Highlight';
import { Hotspots } from './Hotspots';
import { Labels } from './Labels';
import { MergeStatic } from './MergeStatic';
import { cableColorKey, decorCables, nodePositions, resolvePaths, type Vec3 } from './layout';
import { Cable } from './links/Cable';
import { Packets } from './links/Packets';
import { ProblemMarker } from './links/ProblemMarker';
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
import { useIssueScene } from './useIssueScene';

/** De volledige keten van KPN tot apparaat, inclusief de probleemweergave. */
export function NetworkChain() {
  const connectionType = useAppStore((s) => s.connectionType);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const animate = !usePrefersReducedMotion();
  const scene = useIssueScene();

  const nodes = useMemo(() => getActiveNodes(connectionType, hasExtender), [connectionType, hasExtender]);
  const paths = useMemo(
    () =>
      resolvePaths(
        getLinks(connectionType, hasExtender).map((link) => link.id),
        hasExtender,
      ),
    [connectionType, hasExtender],
  );
  const behaviours = useMemo(() => paths.map(scene.behaviour), [paths, scene]);
  const decor = useMemo(
    () => decorCables.map((points) => new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))),
    [],
  );
  // Plekken waar pakketjes stranden, voor de probleemmarkering.
  const markers = useMemo(
    () =>
      paths.flatMap((path, i) => {
        const b = behaviours[i];
        if (b.kind !== 'stop') return [];
        const p = path.curve.getPointAt(b.stopAt);
        // Kleiner bij dunne binnenkabels en in de lucht, waar de camera dichterbij komt.
        const scale = path.cable === 'indoor' ? 0.45 : path.medium === 'air' ? 0.6 : 1;
        return [
          { key: `${path.linkId}-${path.deviceId ?? ''}`, position: [p.x, p.y + 0.35 * scale, p.z] as Vec3, scale },
        ];
      }),
    [paths, behaviours],
  );

  const { nodeStatus, linkStatus, contextStatus } = scene;

  return (
    <group>
      <Highlight status={contextStatus}>
        <Neighborhood />
        <MergeStatic>
          <House />
        </MergeStatic>
      </Highlight>
      <Highlight status={nodeStatus('kpn-core')}>
        <MergeStatic>
          <KpnCore position={nodePositions['kpn-core']} />
        </MergeStatic>
      </Highlight>
      <Highlight status={nodeStatus('backbone')}>
        <MergeStatic>
          <Backbone position={nodePositions.backbone} />
        </MergeStatic>
      </Highlight>
      <Highlight status={nodeStatus('street-cabinet')}>
        <MergeStatic>
          <StreetCabinet position={nodePositions['street-cabinet']} />
        </MergeStatic>
      </Highlight>
      <Highlight status={nodeStatus('house-connection')}>
        <HouseConnection position={nodePositions['house-connection']} type={connectionType} />
      </Highlight>
      <Highlight status={nodeStatus('modem')}>
        <Modem position={nodePositions.modem} />
      </Highlight>
      <WifiSignal position={nodePositions.wifi} radius={6.5} animate={animate} status={nodeStatus('wifi')} />
      {hasExtender && (
        <>
          <Highlight status={nodeStatus('extender')}>
            <Extender position={nodePositions.extender} />
          </Highlight>
          <WifiSignal position={nodePositions.extender} radius={4} animate={animate} status={nodeStatus('extender')} />
        </>
      )}
      <Devices statusOf={scene.partStatus} />

      {decor.map((curve, i) => (
        <Cable key={i} curve={curve} material={variant(materials.cable.decor, contextStatus)} radius={0.05} />
      ))}
      {paths
        .filter((path) => path.medium === 'cable')
        .map((path) => (
          <Cable
            key={`${path.linkId}-${connectionType}`}
            curve={path.curve}
            material={variant(materials.cable[cableColorKey(path.cable!, connectionType)], linkStatus(path.linkId))}
            radius={path.cable === 'indoor' ? 0.03 : 0.07}
          />
        ))}
      <Packets paths={paths} behaviours={behaviours} connectionType={connectionType} animate={animate} />
      {markers.map((marker) => (
        <ProblemMarker key={marker.key} position={marker.position} scale={marker.scale} animate={animate} />
      ))}
      {scene.issue && <IssuePulse animate={animate} />}

      <Hotspots activeNodeIds={nodes.map((node) => node.id)} />
      <Labels nodes={nodes} nodeStatus={nodeStatus} partStatus={scene.partStatus} />
    </group>
  );
}
