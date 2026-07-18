import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import ArchiveList from "@/components/site/ArchiveList";
import { getArchivePage } from "@/lib/reviews-source";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "Archive — The Broadway Art Ledger" };

// Archive — the finding surface. Reviews (/) is for reading straight down; this
// is for retrieving a particular review. Search runs server-side and the browse
// list is paginated, so nothing scales with the whole archive on the client.
export default async function ArchivePage() {
  const page = await getArchivePage(0);

  return (
    <main className={styles.root}>
      <Header active="Archive" />
      <section className={styles.archive}>
        <h1 className={styles.arcTitle}>Archive</h1>
        <ArchiveList
          initialItems={page.items}
          initialHasMore={page.hasMore}
          initialOffset={page.nextOffset}
        />
      </section>
    </main>
  );
}
