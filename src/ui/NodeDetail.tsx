import { useEffect, useRef } from 'react';
import { getActiveNodes } from '../content';
import type { NodeId } from '../content/types';
import { t } from '../i18n';
import { useAppStore } from '../state/store';

/** Uitleg over één onderdeel, met vorige/volgende om de keten door te lopen. */
export function NodeDetail({ nodeId }: { nodeId: NodeId }) {
  const connectionType = useAppStore((s) => s.connectionType);
  const hasExtender = useAppStore((s) => s.hasExtender);
  const focusNode = useAppStore((s) => s.focusNode);
  const heading = useRef<HTMLHeadingElement>(null);

  const nodes = getActiveNodes(connectionType, hasExtender);
  const index = nodes.findIndex((node) => node.id === nodeId);
  const node = nodes[index];
  const previous = nodes[index - 1];
  const next = nodes[index + 1];

  // Focus naar de kop, zodat toetsenbord- en schermlezergebruikers meteen bij de uitleg zijn.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [nodeId]);

  if (!node) return null;

  return (
    <article className="flex flex-col gap-5 p-5" aria-labelledby="node-title">
      <button
        type="button"
        onClick={() => focusNode(null)}
        className="self-start rounded-lg py-1 text-sm font-medium text-kpn-green-dark hover:underline focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
      >
        ← {t('node.back')}
      </button>

      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {t('node.position', { index: index + 1, total: nodes.length })}
        </p>
        <h2 id="node-title" ref={heading} tabIndex={-1} className="mt-1 text-xl font-bold outline-none">
          {node.title}
        </h2>
      </header>

      <p className="leading-relaxed">{node.description}</p>

      {node.parts && (
        <section aria-labelledby="parts-heading">
          <h3 id="parts-heading" className="mb-2 text-sm font-semibold">
            {t('node.parts')}
          </h3>
          <ul className="flex flex-col gap-1 text-sm">
            {node.parts.map((part) => (
              <li key={part.id} className="flex justify-between rounded-lg bg-scene px-3 py-2">
                <span className="font-medium">{part.label}</span>
                <span className="text-ink-muted">{t('node.partRoom', { room: part.room })}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="mt-2 grid grid-cols-2 gap-2" aria-label={t('nodes.heading')}>
        {previous ? (
          <button
            type="button"
            onClick={() => focusNode(previous.id)}
            className="rounded-xl border border-line px-3 py-2 text-left hover:border-kpn-green focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
          >
            <span className="block text-xs text-ink-muted">← {t('node.previous')}</span>
            <span className="block text-sm font-medium">{previous.label}</span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button
            type="button"
            onClick={() => focusNode(next.id)}
            className="rounded-xl border border-line px-3 py-2 text-right hover:border-kpn-green focus-visible:outline-2 focus-visible:outline-kpn-green-dark"
          >
            <span className="block text-xs text-ink-muted">{t('node.next')} →</span>
            <span className="block text-sm font-medium">{next.label}</span>
          </button>
        )}
      </nav>
    </article>
  );
}
