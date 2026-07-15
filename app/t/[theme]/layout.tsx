import { notFound } from "next/navigation";
import { getTheme, themes } from "@/lib/themes";
import Switcher from "@/components/Switcher";

export function generateStaticParams() {
  return themes.map((t) => ({ theme: t.key }));
}

export default function ThemeLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { theme: string };
}) {
  if (!getTheme(params.theme)) notFound();
  return (
    <div data-theme={params.theme}>
      {children}
      <Switcher themes={themes.map((t) => ({ key: t.key, name: t.name }))} current={params.theme} />
    </div>
  );
}
