import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { getReviews } from "@/lib/reviews-data";

// ISR: prerendered at build, revalidated from Airtable every 15s (no redeploy).
export const revalidate = 15;

export default async function ThemeHome({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: t } = await params;
  const theme = getTheme(t);
  if (!theme) notFound();
  const reviews = await getReviews();
  const Home = theme.Home;
  return <Home reviews={reviews} t={t} />;
}
