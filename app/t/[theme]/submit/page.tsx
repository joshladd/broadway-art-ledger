import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { submitFields } from "@/content/reviews";

export default function SubmitRoute({
  params,
  searchParams,
}: {
  params: { theme: string };
  searchParams: { sent?: string };
}) {
  const theme = getTheme(params.theme);
  if (!theme) notFound();
  const Submit = theme.Submit;
  return <Submit fields={submitFields} t={params.theme} sent={searchParams?.sent === "1"} />;
}
