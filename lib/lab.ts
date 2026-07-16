import type { ComponentType } from "react";
import type { Review } from "@/content/reviews";

// The /lab blast — experimental layout/scroll/interaction studies that share the
// Airtable data and house type system with /t, but reimagine how reviews are
// composed in space. Each design's View is a "use client" component, so its meta
// lives here (server-side) rather than being read off the client module's default
// export (which would arrive as an opaque client reference).
export type LabMeta = { key: string; name: string; blurb: string };
export type LabView = ComponentType<{ reviews: Review[] }>;

import Salon from "@/lab/salon";
import Stack from "@/lab/stack";
import Splash from "@/lab/splash";
import Catalogue from "@/lab/catalogue";
import Promenade from "@/lab/promenade";

export const labs: LabMeta[] = [
  { key: "salon", name: "Salon", blurb: "A gallery-wall index — tap a work to read it." },
  { key: "stack", name: "Stack", blurb: "Full-screen scroll-snap cards on a visible stack." },
  { key: "splash", name: "Splash", blurb: "A kinetic masthead and scroll-choreographed reveals." },
  { key: "catalogue", name: "Catalogue", blurb: "A numbered text index; hover previews, tap expands." },
  { key: "promenade", name: "Promenade", blurb: "A horizontal gallery walk; vertical on mobile." },
];

const views: Record<string, LabView> = {
  salon: Salon,
  stack: Stack,
  splash: Splash,
  catalogue: Catalogue,
  promenade: Promenade,
};

export function getLabView(key: string): LabView | undefined {
  return views[key];
}
export function getLabMeta(key: string): LabMeta | undefined {
  return labs.find((l) => l.key === key);
}
