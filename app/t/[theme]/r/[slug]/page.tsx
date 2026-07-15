import { notFound } from "next/navigation";
import { getTheme } from "@/lib/themes";
import { reviews } from "@/content/reviews";

export default function ReviewRoute({ params }: { params: { theme: string; slug: string } }) {
  const theme = getTheme(params.theme);
  if (!theme) notFound();
  const i = reviews.findIndex((r) => r.slug === params.slug);
  if (i < 0) notFound();
  const ReviewPage = theme.ReviewPage;
  return (
    <ReviewPage
      review={reviews[i]}
      prev={i > 0 ? reviews[i - 1] : null}
      next={i < reviews.length - 1 ? reviews[i + 1] : null}
      t={params.theme}
    />
  );
}
