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
import { cableColorKey, decorCables, neighborHouses, resolvePaths, type SceneLayout, type Vec3 } from './layout';
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

/** 2,4 GHz reikt verder maar is trager; 5 GHz is sneller maar reikt minder ver. */
const bands = {
  normal: { radius: 1, pace: 1 },
  '2.4': { radius: 1.35, pace: 0.7 },
  '5': { radius: 0.75, pace: 1.5 },
} as const;

/** Wifi-netwerken van de buren (bij 'drukte in de lucht'): naast het huis en in de buurhuizen. */
const neighbourWifi = (houseWidth: number): Vec3[] => [
  [-2.4, 1.5, 0.5],
  [houseWidth + 2.4, 1.5, 0.5],
  ...neighborHouses.slice(0, 3).map(([x, z]) => [x, 1.5, z] as Vec3),
];

/** De volledige keten van KPN tot apparaat, inclusief de probleemweergave en 'Jouw huis'. */
export function NetworkChain({ layout }: { layout: SceneLayout }) {
  const connectionType = useAppStore((s) => s.connectionType);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const mode = useAppStore((s) => s.mode);
  const focusNodeId = useAppStore((s) => s.focusNodeId);
  const wifiBand = useAppStore((s) => s.wifiBand);
  const animate = !usePrefersReducedMotion();
  const home = useHome();
  const scene = useIssueScene(home.coverage);
  const band = bands[wifiBand ?? 'normal'];
  const { nodePositions, devicePositions, extenderPositions, shownExtenders, floorOf, shown, visibleFloor, house } = layout;

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
  const visibleExtenders = extenderPositions.filter((_, i) => shownExtenders[i]);
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
          extenders={visibleExtenders}
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
          <WifiSignal
            position={nodePositions.wifi}
            radius={6.5 * band.radius}
            pace={band.pace}
            animate={animate}
            status={nodeStatus('wifi')}
          />
        </>
      )}
      {visibleExtenders.map((position, i) => (
        <group key={`${i}-${position.join(',')}`}>
          <Highlight status={nodeStatus('extender')}>
            <Extender position={position} />
          </Highlight>
          <WifiSignal position={position} radius={4 * band.radius} pace={band.pace} animate={animate} status={nodeStatus('extender')} />
        </group>
      ))}
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
      {scene.issue?.sceneExtra === 'interference' &&
        neighbourWifi(house.width).map((position) => (
          <WifiSignal key={position.join(',')} position={position} radius={4.5} animate={animate} status="affected" />
        ))}

      <Hotspots hotspots={layout.hotspots} activeNodeIds={nodes.map((node) => node.id)} />
      <Labels layout={layout} nodes={nodes} nodeStatus={nodeStatus} partStatus={scene.partStatus} />
    </group>
  );
}
