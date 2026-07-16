// Lab registry — METADATA ONLY. This module is imported by client components
// (LabSwitcher) and the homepage, so it must NOT import the view components
// (some are server components; a client module importing one is an error).
// The key → View map lives in app/lab/[design]/page.tsx (a server component).
export type LabKind = "feed" | "archive";
export type LabMeta = { key: string; name: string; blurb: string; kind: LabKind };

export const labs: LabMeta[] = [
  // Feed views — the reading experience. Splash is the canonical feed structure.
  { key: "splash", name: "Splash", kind: "feed", blurb: "The canonical feed — masthead hands off into a scrolling cover story." },
  // Archive views — list views (each gets a designed search + filter slot).
  { key: "index", name: "Index", kind: "archive", blurb: "A ruled reading index — the list, with search & filters." },
  { key: "stacks", name: "Stacks", kind: "archive", blurb: "Riso stacked cards that open on tap; search & filters up top." },
  { key: "portal", name: "Portal", kind: "archive", blurb: "A cover grid that zooms into the essay." },
  { key: "salon", name: "Salon", kind: "archive", blurb: "A gallery-wall index of the collection." },
  // Feed experiments (kept for reference).
  { key: "flip", name: "Flip", kind: "feed", blurb: "Fullscreen covers that flip in 3D to the review." },
  { key: "cutout", name: "Cutout", kind: "feed", blurb: "The art shows through the giant title." },
];

export function getLabMeta(key: string): LabMeta | undefined {
  return labs.find((l) => l.key === key);
}
