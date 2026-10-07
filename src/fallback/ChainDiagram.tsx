import { useMemo } from 'react';
import { getActiveNodes, getLinks } from '../content';
import type { NetworkLink, NetworkNode, NodeId } from '../content/types';
import { t } from '../i18n';
import { useIsDesktop } from '../app/hooks';
import { issueStatus, useActiveIssue, type Status } from '../state/issueStatus';
import { useAppStore } from '../state/store';
import { useHome } from '../state/useHome';
import { colors } from '../theme';

/** Onderdelen vanaf hier staan in je huis. */
const firstInHouse: NodeId = 'house-connection';
const wireless = (link: NetworkLink) => link.from === 'wifi' || link.from === 'extender' || link.to === 'wifi';

/**
 * In de content zendt de KPN Box zelf de wifi uit (wifi-verbindingen starten bij 'wifi').
 * In het diagram tekenen we die stap als stippellijn; er komt iets over als er wifi bij je apparaten aankomt.
 */
const modemToWifi: NetworkLink = { id: 'modem__wifi', from: 'modem', to: 'wifi', connectionTypes: ['fiber', 'dsl'] };
const carriesVia = (link: NetworkLink) => (link === modemToWifi ? 'wifi__devices' : link.id);

const nodeColors: Record<Status, { fill: string; stroke: string; text: string }> = {
  normal: { fill: colors.surface, stroke: colors.kpnGreen, text: colors.text },
  affected: { fill: colors.warningSoft, stroke: colors.warning, text: colors.text },
  dimmed: { fill: colors.surface, stroke: colors.dimmed, text: colors.textMuted },
};

type Point = { x: number; y: number };

/**
 * 2D-fallback als WebGL niet beschikbaar is (of met ?2d in de URL): de keten als
 * eenvoudig SVG-diagram, met dezelfde focus- en probleemstatus als de 3D-scène.
 * Horizontaal op desktop, verticaal op mobiel.
 */
export function ChainDiagram() {
  const connectionType = useAppStore((s) => s.connectionType);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const focusNodeId = useAppStore((s) => s.focusNodeId);
  const focusNode = useAppStore((s) => s.focusNode);
  const issue = useActiveIssue();
  const horizontal = useIsDesktop();

  const nodes = getActiveNodes(connectionType, hasExtender);
  const links = getLinks(connectionType, hasExtender);
  const { coverage } = useHome();
  const status = useMemo(() => issueStatus(issue, coverage), [issue, coverage]);

  const step = horizontal ? 112 : 66;
  const pos = (i: number): Point => (horizontal ? { x: 60 + i * step, y: 90 } : { x: 48, y: 44 + i * step });
  const width = horizontal ? 120 + (nodes.length - 1) * step : 320;
  const height = horizontal ? 200 : 88 + (nodes.length - 1) * step;
  const index = (id: NodeId) => nodes.findIndex((node) => node.id === id);
  const houseStart = pos(index(firstInHouse));
  const last = pos(nodes.length - 1);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 overflow-auto p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full max-h-full w-full max-w-4xl"
        role="group"
        aria-label={t('fallback.ariaLabel')}
      >
        {/* Je huis */}
        <rect
          x={horizontal ? houseStart.x - 46 : 12}
          y={horizontal ? 24 : houseStart.y - 30}
          width={horizontal ? last.x - houseStart.x + 92 : width - 24}
          height={horizontal ? 150 : last.y - houseStart.y + 60}
          rx={16}
          fill={colors.sceneBackground}
          stroke={colors.border}
        />
        <text
          x={horizontal ? houseStart.x - 34 : width - 24}
          y={horizontal ? 42 : houseStart.y - 12}
          textAnchor={horizontal ? 'start' : 'end'}
          fontSize={11}
          fill={colors.textMuted}
        >
          {t('fallback.house')}
        </text>

        {[modemToWifi, ...links].map((link) => {
          const a = index(link.from);
          const b = index(link.to);
          if (a < 0 || b < 0) return null;
          return (
            <Link
              key={link.id}
              from={pos(a)}
              to={pos(b)}
              skip={b - a > 1}
              horizontal={horizontal}
              link={link}
              status={status}
              copper={connectionType === 'dsl' && link.id === 'street-cabinet__house-connection'}
            />
          );
        })}

        {nodes.map((node, i) => (
          <Node
            key={node.id}
            node={node}
            at={pos(i)}
            horizontal={horizontal}
            status={status.nodeStatus(node.id)}
            subLabel={deviceSubLabel(node, status)}
            focused={focusNodeId === node.id}
            onSelect={() => focusNode(node.id)}
          />
        ))}
      </svg>
      <p className="text-center text-xs text-ink-muted">{t('fallback.notice')}</p>
    </div>
  );
}

/** Bij apparaten: noem het betrokken apparaat. */
function deviceSubLabel(node: NetworkNode, status: ReturnType<typeof issueStatus>) {
  const affected = node.parts?.filter((part) => status.partStatus(part.id) === 'affected') ?? [];
  return affected.length && affected.length < (node.parts?.length ?? 0) ? affected.map((p) => p.label).join(', ') : undefined;
}

type LinkProps = {
  from: Point;
  to: Point;
  skip: boolean;
  horizontal: boolean;
  link: NetworkLink;
  status: ReturnType<typeof issueStatus>;
  /** DSL: het laatste stuk naar je huis is een koperen telefoonkabel. */
  copper: boolean;
};

function Link({ from, to, skip, horizontal, link, status, copper }: LinkProps) {
  const linkStatus = status.linkStatus(link.id);
  const carries = status.linkCarries(carriesVia(link));
  // Verbindingen die een onderdeel overslaan (wifi → apparaten langs het SuperWifi-punt) buigen uit.
  const bend = 42;
  const d = skip
    ? horizontal
      ? `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${from.y + bend * 2} ${to.x} ${to.y}`
      : `M ${from.x} ${from.y} Q ${from.x + bend * 2} ${(from.y + to.y) / 2} ${to.x} ${to.y}`
    : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  const healthy = copper ? colors.copperCable : colors.kpnGreen;
  const stroke = linkStatus === 'affected' ? colors.warning : carries ? healthy : colors.dimmed;
  const blocked = status.issue?.visualEffect === 'blocked' && linkStatus === 'affected';
  const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };

  return (
    <g>
      <path d={d} fill="none" stroke={stroke} strokeWidth={wireless(link) ? 2 : 4} strokeDasharray={wireless(link) ? '3 6' : undefined} opacity={carries ? 1 : 0.6} />
      {/* Stromende 'pakketjes': alleen waar nog iets aankomt; stil bij reduced motion. */}
      {carries && !blocked && (
        <path d={d} fill="none" stroke={linkStatus === 'affected' ? colors.packetProblem : colors.packet} strokeWidth={wireless(link) ? 3 : 2.5} strokeLinecap="round" className="chain-flow" />
      )}
      {blocked && (
        <g transform={`translate(${mid.x} ${mid.y})`}>
          <circle r={10} fill={colors.surface} stroke={colors.warning} strokeWidth={2.5} />
          <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke={colors.warningDark} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

type NodeProps = {
  node: NetworkNode;
  at: Point;
  horizontal: boolean;
  status: Status;
  subLabel?: string;
  focused: boolean;
  onSelect: () => void;
};

function Node({ node, at, horizontal, status, subLabel, focused, onSelect }: NodeProps) {
  const c = nodeColors[status];
  const labelX = horizontal ? at.x : at.x + 34;
  const labelY = horizontal ? at.y + 44 : at.y + 4;
  const anchor = horizontal ? 'middle' : 'start';

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${node.title}${status === 'affected' ? ` – ${t('issue.affected')}` : ''}`}
      aria-pressed={focused}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-ink"
    >
      <circle cx={at.x} cy={at.y} r={focused ? 26 : 22} fill={c.fill} stroke={focused ? colors.kpnGreenDark : c.stroke} strokeWidth={focused ? 4 : 3} />
      {status === 'affected' ? (
        <path
          transform={`translate(${at.x - 10} ${at.y - 11}) scale(1.3)`}
          d="M8 1.5a1 1 0 0 1 .87.5l6.5 11.25A1 1 0 0 1 14.5 14.75h-13a1 1 0 0 1-.87-1.5L7.13 2A1 1 0 0 1 8 1.5Zm0 4a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 5.5Zm0 6.25a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z"
          fill={colors.warningDark}
        />
      ) : (
        <circle cx={at.x} cy={at.y} r={6} fill={status === 'dimmed' ? colors.dimmed : colors.kpnGreen} />
      )}
      <text x={labelX} y={labelY} textAnchor={anchor} fontSize={12} fontWeight={600} fill={c.text}>
        {node.label}
      </text>
      {subLabel && (
        <text x={labelX} y={labelY + 15} textAnchor={anchor} fontSize={11} fill={colors.warningDark}>
          {subLabel}
        </text>
      )}
    </g>
  );
}
