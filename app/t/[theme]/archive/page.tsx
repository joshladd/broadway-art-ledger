import { notFound, redirect } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { getReviews } from "@/lib/reviews-data";

// ISR: prerendered/served fresh from Airtable within 15s (no redeploy).
export const revalidate = 15;

export default async function ThemeArchivePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: t } = await params;
  const theme = getTheme(t);
  if (!theme) notFound();
  const Archive = theme.Archive;
  // Themes without their own archive fall back to the shared one.
  if (!Archive) redirect(`/archive?from=${t}`);
  const reviews = await getReviews();
  return <Archive reviews={reviews} t={t} />;
}
