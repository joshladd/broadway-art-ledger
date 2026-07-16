import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { reviews } from "@/content/reviews";

export default async function ReviewRoute({ params }: { params: Promise<{ theme: string; slug: string }> }) {
  const { theme: t, slug } = await params;
  const theme = getTheme(t);
  if (!theme) notFound();
  const i = reviews.findIndex((r) => r.slug === slug);
  if (i < 0) notFound();
  const ReviewPage = theme.ReviewPage;
  return (
    <ReviewPage
      review={reviews[i]}
      prev={i > 0 ? reviews[i - 1] : null}
      next={i < reviews.length - 1 ? reviews[i + 1] : null}
      t={t}
    />
  );
}
