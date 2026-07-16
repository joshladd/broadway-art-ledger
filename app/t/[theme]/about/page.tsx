import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { about } from "@/content/reviews";

export default async function AboutRoute({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: t } = await params;
  const theme = getTheme(t);
  if (!theme) notFound();
  const About = theme.About;
  return <About about={about} t={t} />;
}
