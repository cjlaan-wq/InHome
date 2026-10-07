import { Html } from '@react-three/drei';
import type { DevicePart, NetworkNode } from '../content/types';
import { useThree } from '@react-three/fiber';
import { compactLabelNodes, devicePositions, labelOffset, nodePositions, type Vec3 } from './layout';

/** Onder deze canvasbreedte tonen we alleen de hoofdlabels, anders overlappen ze in het huis. */
const compactWidth = 640;

const add = (a: Vec3, b: Vec3 = [0, 0, 0]): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

function Label({ position, text }: { position: Vec3; text: string }) {
  return (
    <Html position={position} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <span className="block whitespace-nowrap rounded-full bg-surface/95 px-2.5 py-1 text-xs font-medium text-ink shadow-sm ring-1 ring-line">
        {text}
      </span>
    </Html>
  );
}

/** Korte labels in de scène. De labeltekst komt uit de content (incl. varianten per verbindingstype). */
export function Labels({ nodes }: { nodes: NetworkNode[] }) {
  const compact = useThree((s) => s.size.width < compactWidth);
  const visible = compact ? nodes.filter((node) => compactLabelNodes.includes(node.id)) : nodes;

  return (
    <>
      {visible.map((node) =>
        node.parts ? (
          node.parts.map((part: DevicePart) => (
            <Label key={part.id} position={add(devicePositions[part.id], [0, 0.55, 0])} text={part.label} />
          ))
        ) : (
          <Label key={node.id} position={add(nodePositions[node.id], labelOffset[node.id])} text={node.label} />
        ),
      )}
    </>
  );
}
