import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { ReviewArticle } from "@/components/site/ReviewArticle";
import { getReviews } from "@/lib/reviews-source";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "The Broadway Art Ledger" };

// Reviews — the reading surface. Every review in full, newest first, as one
// continuous scroll. Finding a specific review is the Archive's job.
export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <main className={styles.root}>
      <Header active="Reviews" />
      {reviews.length === 0 ? (
        // Day one: no reviews published yet. Chrome only — no invented
        // "coming soon". Transient; resolves on Bryan's first publish.
        <div className={styles.empty} />
      ) : (
        <div className={styles.feed}>
          {reviews.map((r, i) => (
            <ReviewArticle key={r.slug} review={r} priority={i === 0} />
          ))}
        </div>
      )}
    </main>
  );
}
