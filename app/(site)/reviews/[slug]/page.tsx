import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/site/Header";
import { ReviewArticle } from "@/components/site/ReviewArticle";
import { getReview, getReviews } from "@/lib/reviews-source";
import styles from "@/components/site/site.module.css";

// A review's own page, so a writer can link to their piece. The full essay,
// rendered exactly as it appears in the feed, with per-review title and OG tags
// so a shared link unfurls with the headline and marquee image.

type Params = { params: Promise<{ slug: string }> };

// Pre-render the known reviews at build; new ones fill in on demand via ISR.
export async function generateStaticParams() {
  const reviews = await getReviews();
  return reviews.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const review = await getReview(slug);
  if (!review) return { title: "Not found — The Broadway Art Ledger" };

  const description = review.tagline?.trim() || review.showName;
  return {
    title: `${review.headline} — The Broadway Art Ledger`,
    description,
    openGraph: {
      title: review.headline,
      description,
      images: review.image.url ? [{ url: review.image.url }] : undefined,
    },
  };
}

export default async function ReviewPage({ params }: Params) {
  const { slug } = await params;
  const review = await getReview(slug);
  if (!review) notFound();

  return (
    <main className={styles.root}>
      <Header active="Reviews" />
      {/* Same .feed wrapper as the home page, so a single review sits with the
          exact spacing and measure it has in the scroll. */}
      <div className={styles.feed}>
        <ReviewArticle review={review} priority />
      </div>
    </main>
  );
}
