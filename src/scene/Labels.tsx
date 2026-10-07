import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { NetworkNode, NodeId, DeviceId } from '../content/types';
import { t } from '../i18n';
import { useAppStore, type Hovered } from '../state/store';
import { compactLabelNodes, devicePositions, focusedLabelOffset, labelOffset, nodePositions, type Vec3 } from './layout';

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
};

/**
 * Label in de scène; bij hoveren klapt het uit tot een tooltip. Ook klikbaar, als groot
 * tikdoel op mobiel. Niet in de tabvolgorde: het paneel is de toetsenbordroute.
 */
function Label({ position, text, tooltip, target, active, hovered }: LabelProps) {
  const setHovered = useAppStore((s) => s.setHovered);
  const focusNode = useAppStore((s) => s.focusNode);

  return (
    <Html position={position} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onPointerEnter={() => setHovered(target)}
        onPointerLeave={() => setHovered(null)}
        onClick={() => focusNode(target.nodeId)}
        className={`pointer-events-auto block cursor-pointer whitespace-nowrap rounded-2xl px-2.5 py-1 text-left text-xs font-medium shadow-sm ring-1 transition-colors ${
          active ? 'bg-kpn-green-dark text-white ring-kpn-green-dark' : 'bg-surface/95 text-ink ring-line'
        }`}
      >
        {text}
        {hovered && (
          <span className={`block w-max max-w-52 whitespace-normal font-normal ${active ? 'text-white' : 'text-ink-muted'}`}>
            {tooltip}
            {!active && <span className="mt-0.5 block text-kpn-green-dark">{t('tooltip.more')} →</span>}
          </span>
        )}
      </button>
    </Html>
  );
}

/** Korte labels in de scène. De teksten komen uit de content (incl. varianten per verbindingstype). */
export function Labels({ nodes }: { nodes: NetworkNode[] }) {
  const compact = useThree((s) => s.size.width < compactWidth);
  const hovered = useAppStore((s) => s.hovered);
  const focusNodeId = useAppStore((s) => s.focusNodeId);

  const isHovered = (nodeId: NodeId, partId?: DeviceId) =>
    hovered?.nodeId === nodeId && (partId === undefined || hovered.partId === undefined || hovered.partId === partId);
  // Op een smal scherm: alleen hoofdlabels, plus het onderdeel waar je mee bezig bent.
  const visible = nodes.filter(
    (node) => !compact || compactLabelNodes.includes(node.id) || node.id === focusNodeId || hovered?.nodeId === node.id,
  );

  return (
    <>
      {visible.map((node) =>
        node.parts ? (
          node.parts.map((part) => (
            <Label
              key={part.id}
              position={add(devicePositions[part.id], [0, 0.55, 0])}
              text={part.label}
              tooltip={t('tooltip.deviceRoom', { device: part.label, room: part.room })}
              target={{ nodeId: node.id, partId: part.id }}
              active={focusNodeId === node.id}
              hovered={isHovered(node.id, part.id)}
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
          />
        ),
      )}
    </>
  );
}
