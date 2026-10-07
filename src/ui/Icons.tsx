/** Waarschuwingsdriehoek: 'betrokken' wordt zo niet alleen met kleur aangegeven. */
export function WarningIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="currentColor">
      <path d="M8 1.5a1 1 0 0 1 .87.5l6.5 11.25A1 1 0 0 1 14.5 14.75h-13a1 1 0 0 1-.87-1.5L7.13 2A1 1 0 0 1 8 1.5Zm0 4a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 8 5.5Zm0 6.25a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z" />
    </svg>
  );
}

export function ExternalIcon({ className = 'size-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M9 3h4v4M13 3 7 9M11 9.5V13H3V5h3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Pictogrammen voor de probleemgroepen. */
export function CategoryIcon({ id, className = 'size-5' }: { id: 'offline' | 'one-place' | 'unstable'; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      {id === 'offline' && (
        <>
          <path d="M2.5 7.5a11 11 0 0 1 15 0M5 10.5a7 7 0 0 1 10 0M7.6 13.4a3 3 0 0 1 4.8 0" {...line} />
          <circle cx="10" cy="16" r="1" fill="currentColor" />
          <path d="M3 3l14 14" {...line} />
        </>
      )}
      {id === 'one-place' && (
        <>
          <rect x="6" y="2.5" width="8" height="15" rx="1.8" {...line} />
          <path d="M9 15h2" {...line} />
        </>
      )}
      {id === 'unstable' && <path d="M2 11h3l2-5 3 9 2.5-7 1.5 3h4" {...line} />}
    </svg>
  );
}

export function ChevronIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" {...line} />
    </svg>
  );
}

export function HomeIcon({ className = 'size-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5" {...line} />
    </svg>
  );
}

export function RecenterIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4" {...line} />
      <circle cx="10" cy="10" r="2.2" {...line} />
    </svg>
  );
}
