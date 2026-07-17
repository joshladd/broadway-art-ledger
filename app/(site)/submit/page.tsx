import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { PortableCopy } from "@/components/site/PortableCopy";
import { getSubmitContent } from "@/lib/site-content";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "Submit — The Broadway Art Ledger" };

// This epic does NOT build our own form. /submit is Bryan's copy plus a link to
// the Airtable form he already built, so writers can pitch today. Our own form
// is blocked on him converting `Writer Email` from an aiText field.
//
// The page is one rich-text body (Bryan owns its headings, paragraphs, and
// bullets), then the form-link button, then a small blurb. All editable in
// Sanity (submitPage singleton), with content/site.ts as the fallback.
export default async function SubmitPage() {
  const submit = await getSubmitContent();

  return (
    <main className={styles.root}>
      <Header active="Submit" />
      <div className={styles.reader}>
        <div className={styles.readerBody}>
          <PortableCopy value={submit.body} variant="editorial" />
        </div>

        {/* Outbound handoff to Bryan's Airtable form. New tab: it's a different
            product, and a writer shouldn't hit a dead end. */}
        <a
          className={styles.formLink}
          href={submit.formUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open the pitch form
        </a>

        {/* The little blurb under the button — the contact line. */}
        <div className={styles.readerBody}>
          <PortableCopy value={submit.blurb} />
        </div>
      </div>
    </main>
  );
}
