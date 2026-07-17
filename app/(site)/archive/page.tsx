import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import ArchiveList from "@/components/site/ArchiveList";
import { getReviews } from "@/lib/reviews-source";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "Archive — The Broadway Art Ledger" };

// Archive — the finding surface. Reviews (/) is for reading straight down;
// this is for retrieving a particular review without the raw scroll.
export default async function ArchivePage() {
  const reviews = await getReviews();

  return (
    <main className={styles.root}>
      <Header active="Archive" />
      <section className={styles.archive}>
        <h1 className={styles.arcTitle}>Archive</h1>
        <ArchiveList reviews={reviews} />
      </section>
    </main>
  );
}
