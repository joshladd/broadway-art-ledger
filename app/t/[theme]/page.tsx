import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { reviews } from "@/content/reviews";

export default function ThemeHome({ params }: { params: { theme: string } }) {
  const theme = getTheme(params.theme);
  if (!theme) notFound();
  const Home = theme.Home;
  return <Home reviews={reviews} t={params.theme} />;
}
