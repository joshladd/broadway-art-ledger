import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { labs } from "@/lib/lab";
// The exploration is frozen: it renders the static legacy seed, never live
// data. This is what keeps /designs immune to the live content model.
import { reviews } from "@/content/reviews";
import type { Review } from "@/content/reviews";

// Server-only key → View map. Because this is a server component, it can import
// BOTH client-component views (splash/flip/cutout/portal/stacks) and
// server-component views (index) — the client/server boundary is respected.
import Splash from "@/lab/splash";
import Portal from "@/lab/portal";
import Salon from "@/lab/salon";
import IndexArchive from "@/lab/index";
import Stacks from "@/lab/stacks";

const views: Record<string, ComponentType<{ reviews: Review[] }>> = {
  splash: Splash,
  index: IndexArchive,
  stacks: Stacks,
  portal: Portal,
  salon: Salon,
};

export function generateStaticParams() {
  return labs.map((l) => ({ design: l.key }));
}

export default async function LabDesignPage({ params }: { params: Promise<{ design: string }> }) {
  const { design } = await params;
  const View = views[design];
  if (!View) notFound();
  return <View reviews={reviews} />;
}
