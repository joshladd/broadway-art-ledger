import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import ArchiveList from "@/components/site/ArchiveList";
import { getArchiveItems } from "@/lib/reviews-source";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "Archive — The Broadway Art Ledger" };

// Archive — the finding surface. Reviews (/) is for reading straight down;
// this is for retrieving a particular review without the raw scroll. It fetches
// a compact search index (plain text + thumbnails), not full reviews.
export default async function ArchivePage() {
  const items = await getArchiveItems();

  return (
    <main className={styles.root}>
      <Header active="Archive" />
      <section className={styles.archive}>
        <h1 className={styles.arcTitle}>Archive</h1>
        <ArchiveList items={items} />
      </section>
    </main>
  );
}
