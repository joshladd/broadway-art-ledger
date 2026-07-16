// Lab registry — METADATA ONLY. This module is imported by client components
// (LabSwitcher) and the homepage, so it must NOT import the view components
// (some are server components; a client module importing one is an error).
// The key → View map lives in app/lab/[design]/page.tsx (a server component).
export type LabKind = "feed" | "archive";
export type LabMeta = { key: string; name: string; blurb: string; kind: LabKind };

export const labs: LabMeta[] = [
  // Feed view — the reading experience. Splash is the canonical feed structure.
  { key: "splash", name: "Splash", kind: "feed", blurb: "The canonical feed — masthead hands off into a scrolling cover story." },
  // Archive views — list views. Each one is a list + a designed search slot + a
  // designed filters slot. (Flip & Cutout were feed experiments, now retired —
  // Splash is the feed canon.)
  { key: "index", name: "Index", kind: "archive", blurb: "A ruled reading index — the list, with search & filters." },
  { key: "stacks", name: "Stacks", kind: "archive", blurb: "Riso stacked cards that open on tap; search & filters up top." },
  { key: "portal", name: "Portal", kind: "archive", blurb: "A cover grid that zooms into the essay; search & filters up top." },
  { key: "salon", name: "Salon", kind: "archive", blurb: "A gallery-wall index of the collection; search & filters up top." },
];

export function getLabMeta(key: string): LabMeta | undefined {
  return labs.find((l) => l.key === key);
}
