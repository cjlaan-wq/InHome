import { useMemo } from 'react';
import * as THREE from 'three';
import { getActiveNodes, getLinks } from '../content';
import { deviceOrder } from '../state/homeGeometry';
import { useAppStore } from '../state/store';
import { useHome } from '../state/useHome';
import { usePrefersReducedMotion } from '../app/hooks';
import { CoverageOverlay } from './CoverageOverlay';
import { Highlight, IssuePulse, variant } from './Highlight';
import { Hotspots } from './Hotspots';
import { Labels } from './Labels';
import { cableColorKey, decorCables, resolvePaths, type SceneLayout, type Vec3 } from './layout';
import { Cable } from './links/Cable';
import { Packets } from './links/Packets';
import { ProblemMarker } from './links/ProblemMarker';
import { materials } from './materials';
import { MergeStatic } from './MergeStatic';
import { Backbone } from './nodes/Backbone';
import { Devices } from './nodes/Devices';
import { Extender } from './nodes/Extender';
import { House } from './nodes/House';
import { HouseConnection } from './nodes/HouseConnection';
import { KpnCore } from './nodes/KpnCore';
import { Modem } from './nodes/Modem';
import { Neighborhood } from './nodes/Neighborhood';
import { Stands } from './nodes/Stands';
import { StreetCabinet } from './nodes/StreetCabinet';
import { WifiSignal } from './nodes/WifiSignal';
import { RoomDrag } from './RoomDrag';
import { useIssueScene } from './useIssueScene';

/** De volledige keten van KPN tot apparaat, inclusief de probleemweergave en 'Jouw huis'. */
export function NetworkChain({ layout }: { layout: SceneLayout }) {
  const connectionType = useAppStore((s) => s.connectionType);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const mode = useAppStore((s) => s.mode);
  const focusNodeId = useAppStore((s) => s.focusNodeId);
  const animate = !usePrefersReducedMotion();
  const home = useHome();
  const scene = useIssueScene(home.coverage);
  const { nodePositions, devicePositions, floorOf, shown, visibleFloor, house } = layout;

  const nodes = useMemo(() => getActiveNodes(connectionType, hasExtender), [connectionType, hasExtender]);
  const paths = useMemo(
    () =>
      resolvePaths(
        layout.linkPaths,
        getLinks(connectionType, hasExtender).map((link) => link.id),
      ),
    [layout, connectionType, hasExtender],
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
  const shownDevices = deviceOrder.filter((id) => shown(floorOf[id]));
  const modemShown = shown(floorOf.modem);
  const extenderShown = hasExtender && shown(floorOf.extender);
  // Wifi-dekking per kamer: bij 'Jouw huis', bij uitleg over wifi en bij het probleem 'zwak signaal'.
  const showCoverage =
    mode === 'home' || (mode === 'explore' && focusNodeId === 'wifi') || scene.issue?.visualEffect === 'weak-signal';

  return (
    <group>
      <Highlight status={contextStatus}>
        <Neighborhood />
        {/* Opnieuw samenvoegen als het huis of de zichtbare verdiepingen veranderen. */}
        <MergeStatic key={`${house.id}-${visibleFloor}`}>
          <House house={house} visibleFloor={visibleFloor} />
        </MergeStatic>
        <Stands
          modem={nodePositions.modem}
          extender={extenderShown ? nodePositions.extender : undefined}
          devices={devicePositions}
          shownDevices={shownDevices}
          modemShown={modemShown}
        />
      </Highlight>
      {showCoverage && (
        <CoverageOverlay house={house} coverage={home.coverage} visibleFloor={visibleFloor} labels={mode === 'home' || focusNodeId === 'wifi'} />
      )}
      {mode === 'home' && <RoomDrag house={house} visibleFloor={visibleFloor} />}

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
      {shown(floorOf['house-connection']) && (
        <Highlight status={nodeStatus('house-connection')}>
          <HouseConnection position={nodePositions['house-connection']} type={connectionType} />
        </Highlight>
      )}
      {modemShown && (
        <>
          <Highlight status={nodeStatus('modem')}>
            <Modem position={nodePositions.modem} />
          </Highlight>
          <WifiSignal position={nodePositions.wifi} radius={6.5} animate={animate} status={nodeStatus('wifi')} />
        </>
      )}
      {extenderShown && (
        <>
          <Highlight status={nodeStatus('extender')}>
            <Extender position={nodePositions.extender} />
          </Highlight>
          <WifiSignal position={nodePositions.extender} radius={4} animate={animate} status={nodeStatus('extender')} />
        </>
      )}
      <Devices positions={devicePositions} shown={shownDevices} statusOf={scene.partStatus} />

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

      <Hotspots hotspots={layout.hotspots} activeNodeIds={nodes.map((node) => node.id)} />
      <Labels layout={layout} nodes={nodes} nodeStatus={nodeStatus} partStatus={scene.partStatus} />
    </group>
  );
}
