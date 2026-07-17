import { notFound } from "next/navigation";
import { getTheme, themes } from "@/lib/themes";
import Switcher from "@/components/Switcher";

export function generateStaticParams() {
  return themes.map((t) => ({ theme: t.key }));
}

export default async function ThemeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ theme: string }>;
}) {
  const { theme } = await params;
  if (!getTheme(theme)) notFound();
  return (
    <div data-theme={theme}>
      {children}
      <Switcher themes={themes.map((t) => ({ key: t.key, name: t.name }))} current={theme} />
    </div>
  );
}
