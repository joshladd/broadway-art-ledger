import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { reviews } from "@/content/reviews";

export default async function ThemeHome({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: t } = await params;
  const theme = getTheme(t);
  if (!theme) notFound();
  const Home = theme.Home;
  return <Home reviews={reviews} t={t} />;
}
