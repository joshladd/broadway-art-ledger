import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { about } from "@/content/reviews";

export default function AboutRoute({ params }: { params: { theme: string } }) {
  const theme = getTheme(params.theme);
  if (!theme) notFound();
  const About = theme.About;
  return <About about={about} t={params.theme} />;
}
