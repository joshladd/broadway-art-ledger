import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { ReviewArticle } from "@/components/site/ReviewArticle";
import { Feed } from "@/components/site/Feed";
import { getReviewPage, FEED_PAGE_SIZE } from "@/lib/reviews-source";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "The Broadway Art Ledger" };

// Reviews — the reading surface. Newest first; the first page renders on the
// server and more load on scroll (see Feed), so the payload stays bounded as the
// archive grows. Finding a specific review is the Archive's job.
export default async function ReviewsPage() {
  const first = await getReviewPage(0);

  return (
    <main className={styles.root}>
      <Header active="Reviews" />
      {first.length === 0 ? (
        // Day one: no reviews published yet. Chrome only — no invented
        // "coming soon". Transient; resolves on the first publish.
        <div className={styles.empty} />
      ) : (
        <Feed startOffset={first.length} hasMore={first.length === FEED_PAGE_SIZE}>
          {first.map((r, i) => (
            <ReviewArticle key={r.slug} review={r} priority={i === 0} />
          ))}
        </Feed>
      )}
    </main>
  );
}
