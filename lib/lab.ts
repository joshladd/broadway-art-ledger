import type { ComponentType } from "react";
import type { Review } from "@/content/reviews";

// The /lab blast — experimental layout/scroll/interaction studies that share the
// Airtable data and house type system with /t. This set is the "Splash family":
// big-type, flush/fullscreen, animated readings of the same reviews. Each design's
// View is a "use client" component, so its meta lives here (server-side) rather
// than being read off the client module's default export (a client reference).
export type LabMeta = { key: string; name: string; blurb: string };
export type LabView = ComponentType<{ reviews: Review[] }>;

import Splash from "@/lab/splash";
import Flip from "@/lab/flip";
import Cutout from "@/lab/cutout";
import Portal from "@/lab/portal";
import Salon from "@/lab/salon";

export const labs: LabMeta[] = [
  { key: "splash", name: "Splash", blurb: "A kinetic masthead and scroll-choreographed cover story." },
  { key: "flip", name: "Flip", blurb: "Fullscreen covers that flip in 3D to the full review." },
  { key: "cutout", name: "Cutout", blurb: "The giant title is the window — the art shows through the type." },
  { key: "portal", name: "Portal", blurb: "Tap a cover and the art zooms up into the essay." },
  { key: "salon", name: "Salon", blurb: "A gallery-wall index — tap a work to read it." },
];

const views: Record<string, LabView> = {
  splash: Splash,
  flip: Flip,
  cutout: Cutout,
  portal: Portal,
  salon: Salon,
};

export function getLabView(key: string): LabView | undefined {
  return views[key];
}
export function getLabMeta(key: string): LabMeta | undefined {
  return labs.find((l) => l.key === key);
}
