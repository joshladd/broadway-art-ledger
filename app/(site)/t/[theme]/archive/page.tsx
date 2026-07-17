import { notFound, redirect } from "next/navigation";
import { getTheme } from "@/lib/themes";
// The exploration is frozen: it renders the static legacy seed, never live
// data. This is what keeps /designs immune to the live content model.
import { reviews } from "@/content/reviews";

export default async function ThemeArchivePage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme: t } = await params;
  const theme = getTheme(t);
  if (!theme) notFound();
  const Archive = theme.Archive;
  // Themes without their own archive fall back to the shared one.
  if (!Archive) redirect(`/designs/archive?from=${t}`);
  return <Archive reviews={reviews} t={t} />;
}
