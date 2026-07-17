import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
// The exploration is frozen: it renders the static legacy seed, never live
// data. This is what keeps /designs immune to the live content model.
import { reviews } from "@/content/reviews";

export default async function ThemeHome({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: t } = await params;
  const theme = getTheme(t);
  if (!theme) notFound();
  const Home = theme.Home;
  return <Home reviews={reviews} t={t} />;
}
