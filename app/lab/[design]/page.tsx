import { notFound } from "next/navigation";
import { getLabView, labs } from "@/lib/lab";
import { getReviews } from "@/lib/reviews-data";

// ISR: prerendered at build, revalidated from Airtable every 60s.
export const revalidate = 60;

export function generateStaticParams() {
  return labs.map((l) => ({ design: l.key }));
}

export default async function LabDesignPage({ params }: { params: Promise<{ design: string }> }) {
  const { design } = await params;
  const View = getLabView(design);
  if (!View) notFound();
  const reviews = await getReviews();
  return <View reviews={reviews} />;
}
