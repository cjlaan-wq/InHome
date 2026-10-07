import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { NetworkNode, NodeId, DeviceId } from '../content/types';
import { t } from '../i18n';
import { useAppStore, type Hovered } from '../state/store';
import { WarningIcon } from '../ui/Icons';
import type { Status } from './Highlight';
import { useHome } from '../state/useHome';
import { compactLabelNodes, focusedLabelOffset, type SceneLayout, type Vec3 } from './layout';

/** Onder deze canvasbreedte tonen we alleen de hoofdlabels, anders overlappen ze in het huis. */
const compactWidth = 640;

const add = (a: Vec3, b: Vec3 = [0, 0, 0]): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

type LabelProps = {
  position: Vec3;
  text: string;
  tooltip: string;
  target: Hovered;
  active: boolean;
  hovered: boolean;
  status: Status;
};

const labelStyle = (status: Status, active: boolean) => {
  if (status === 'affected')
    return active ? 'bg-warning-dark text-white ring-warning-dark' : 'bg-warning-soft text-ink ring-warning';
  if (active) return 'bg-kpn-green-dark text-white ring-kpn-green-dark';
  return status === 'dimmed' ? 'bg-surface/80 text-ink-muted ring-line' : 'bg-surface/95 text-ink ring-line';
};

/**
 * Label in de scène; bij hoveren klapt het uit tot een tooltip. Ook klikbaar, als groot
 * tikdoel op mobiel. Niet in de tabvolgorde: het paneel is de toetsenbordroute.
 */
function Label({ position, text, tooltip, target, active, hovered, status }: LabelProps) {
  const setHovered = useAppStore((s) => s.setHovered);
  const focusNode = useAppStore((s) => s.focusNode);
  // In 'Jouw huis' blijft de camera op het huis; daar sleep je in plaats van te klikken.
  const homeMode = useAppStore((s) => s.mode === 'home');

  return (
    // Verankerd aan de onderkant: een uitklappende tooltip groeit naar boven, weg van het object
    // (anders ligt hij over het object en kun je het niet meer oppakken of aanklikken).
    <Html position={position} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-3">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onPointerEnter={() => setHovered(target)}
        onPointerLeave={() => setHovered(null)}
        onClick={() => !homeMode && focusNode(target.nodeId)}
        className={`pointer-events-auto block cursor-pointer whitespace-nowrap rounded-2xl px-2.5 py-1 text-left text-xs font-medium shadow-sm ring-1 transition-colors ${labelStyle(status, active)}`}
      >
        <span className="flex items-center gap-1">
          {status === 'affected' && <WarningIcon className={`size-3.5 ${active ? 'text-white' : 'text-warning-dark'}`} />}
          {text}
        </span>
        {hovered && (
          <span className={`block w-max max-w-52 whitespace-normal font-normal ${active ? 'text-white' : 'text-ink-muted'}`}>
            {tooltip}
            {!active && (
              <span className={`mt-0.5 block ${status === 'affected' ? 'text-warning-dark' : 'text-kpn-green-dark'}`}>
                {homeMode && (target.partId || target.nodeId === 'modem' || target.nodeId === 'extender')
                  ? t('scene.dragHere')
                  : `${t('tooltip.more')} →`}
              </span>
            )}
          </span>
        )}
      </button>
      </div>
    </Html>
  );
}

/** Korte labels in de scène. De teksten komen uit de content (incl. varianten per verbindingstype). */
type LabelsProps = {
  layout: SceneLayout;
  nodes: NetworkNode[];
  nodeStatus: (id: NodeId) => Status;
  partStatus: (id: DeviceId) => Status;
};

export function Labels({ layout, nodes, nodeStatus, partStatus }: LabelsProps) {
  const { nodePositions, devicePositions, extenderPositions, shownExtenders, labelOffset, floorOf, shown } = layout;
  const home = useHome();
  const compact = useThree((s) => s.size.width < compactWidth);
  const hovered = useAppStore((s) => s.hovered);
  const focusNodeId = useAppStore((s) => s.focusNodeId);

  const isHovered = (nodeId: NodeId, partId?: DeviceId) =>
    hovered?.nodeId === nodeId && (partId === undefined || hovered.partId === undefined || hovered.partId === partId);
  // Op een smal scherm: alleen hoofdlabels, plus het onderdeel waar je mee bezig bent en betrokken onderdelen.
  const onVisibleFloor = (id: NodeId) =>
    id === 'house-connection' || id === 'modem' ? shown(floorOf[id]) : id !== 'extender' || shownExtenders.some(Boolean);
  const visible = nodes.filter(
    (node) =>
      onVisibleFloor(node.id) &&
      (!compact ||
      compactLabelNodes.includes(node.id) ||
      node.id === focusNodeId ||
      hovered?.nodeId === node.id ||
      nodeStatus(node.id) === 'affected'),
  );

  return (
    <>
      {visible.map((node) =>
        node.id === 'extender' ? (
          // Eén label per SuperWifi-punt; genummerd als er meer zijn.
          extenderPositions.map((position, i) =>
            shownExtenders[i] ? (
              <Label
                key={`extender-${i}`}
                position={add(position, labelOffset.extender)}
                text={extenderPositions.length > 1 ? `${node.label} ${i + 1}` : node.label}
                tooltip={node.summary}
                target={{ nodeId: node.id }}
                active={focusNodeId === node.id}
                hovered={isHovered(node.id)}
                status={nodeStatus(node.id)}
              />
            ) : null,
          )
        ) : node.parts ? (
          node.parts.filter((part) => shown(floorOf[part.id])).map((part) => (
            <Label
              key={part.id}
              position={add(devicePositions[part.id], [0, 0.55, 0])}
              text={part.label}
              tooltip={t('tooltip.deviceRoom', { device: part.label, roomIn: home.deviceRoomIn(part.id) })}
              target={{ nodeId: node.id, partId: part.id }}
              active={focusNodeId === node.id}
              hovered={isHovered(node.id, part.id)}
              status={partStatus(part.id)}
            />
          ))
        ) : (
          <Label
            key={node.id}
            position={add(
              nodePositions[node.id],
              (focusNodeId === node.id && focusedLabelOffset[node.id]) || labelOffset[node.id],
            )}
            text={node.label}
            tooltip={node.summary}
            target={{ nodeId: node.id }}
            active={focusNodeId === node.id}
            hovered={isHovered(node.id)}
            status={nodeStatus(node.id)}
          />
        ),
      )}
    </>
  );
}
