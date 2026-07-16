import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { submitFields } from "@/content/reviews";

export default async function SubmitRoute({
  params,
  searchParams,
}: {
  params: Promise<{ theme: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { theme: t } = await params;
  const sp = await searchParams;
  const theme = getTheme(t);
  if (!theme) notFound();
  const Submit = theme.Submit;
  return <Submit fields={submitFields} t={t} sent={sp?.sent === "1"} error={sp?.error === "1"} />;
}
