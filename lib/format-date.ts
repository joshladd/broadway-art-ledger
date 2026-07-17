// CMOS date ranges. Bryan's guidelines state "We follow CMOS", and his example
// is "May 15–June 13, 2026". En dash, no surrounding spaces.
//
//   same year          -> May 15–June 13, 2026
//   same month + year  -> May 15–27, 2026        (CMOS collapses the month)
//   spanning years     -> December 10, 2025–January 20, 2026

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EN_DASH = "–";

type Parts = { y: number; m: number; d: number };

// Parse YYYY-MM-DD without going through Date: `new Date("2026-01-01")` is UTC
// midnight, which renders as Dec 31 for anyone west of UTC. Reviews are dated
// by hand, so the string is the truth — never shift it.
function parse(iso: string): Parts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return null;
  const month = Number(m[2]) - 1;
  if (month < 0 || month > 11) return null;
  return { y: Number(m[1]), m: month, d: Number(m[3]) };
}

function monthDay(p: Parts): string {
  return `${MONTHS[p.m]} ${p.d}`;
}

function full(p: Parts): string {
  return `${monthDay(p)}, ${p.y}`;
}

export function formatRange(startISO: string, endISO: string): string {
  const s = parse(startISO);
  if (!s) return "";
  const e = parse(endISO);
  if (!e) return full(s);

  if (s.y !== e.y) return `${full(s)}${EN_DASH}${full(e)}`;
  if (s.m === e.m) return `${monthDay(s)}${EN_DASH}${e.d}, ${s.y}`;
  return `${monthDay(s)}${EN_DASH}${monthDay(e)}, ${s.y}`;
}
