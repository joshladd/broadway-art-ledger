// The house mark for The Broadway Art Ledger: two offset squares (a riso /
// two-ink register nod). Sizes to 1em and inherits `currentColor`, so callers
// set size via font-size and color via `color` (typically var(--accent)).
// No "use client" — usable from server and client components alike.
export function Mark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <rect x="3.5" y="3.5" width="9.5" height="9.5" />
      <rect x="11" y="11" width="9.5" height="9.5" />
    </svg>
  );
}
