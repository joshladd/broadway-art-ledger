import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { labs } from "@/lib/lab";
import { getReviews } from "@/lib/reviews-data";
import type { Review } from "@/content/reviews";

// Server-only key → View map. Because this is a server component, it can import
// BOTH client-component views (splash/flip/cutout/portal/stacks) and
// server-component views (index) — the client/server boundary is respected.
import Splash from "@/lab/splash";
import Flip from "@/lab/flip";
import Cutout from "@/lab/cutout";
import Portal from "@/lab/portal";
import Salon from "@/lab/salon";
import IndexArchive from "@/lab/index";
import Stacks from "@/lab/stacks";

const views: Record<string, ComponentType<{ reviews: Review[] }>> = {
  splash: Splash,
  flip: Flip,
  cutout: Cutout,
  portal: Portal,
  salon: Salon,
  index: IndexArchive,
  stacks: Stacks,
};

// ISR: prerendered at build, revalidated from Airtable every 60s.
export const revalidate = 60;

export function generateStaticParams() {
  return labs.map((l) => ({ design: l.key }));
}

export default async function LabDesignPage({ params }: { params: Promise<{ design: string }> }) {
  const { design } = await params;
  const View = views[design];
  if (!View) notFound();
  const reviews = await getReviews();
  return <View reviews={reviews} />;
}
