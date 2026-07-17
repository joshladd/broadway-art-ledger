import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { PortableCopy } from "@/components/site/PortableCopy";
import { getSubmitContent } from "@/lib/site-content";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "Submit — The Broadway Art Ledger" };

// This epic does NOT build our own form. /submit is Bryan's copy plus a link to
// the Airtable form he already built, so writers can pitch today. Our own form
// is blocked on him converting `Writer Email` from an aiText field — and we do
// not work around that by folding the email into the pitch body, because his
// guidelines forbid identifying information inside a pitch.
//
// The copy is editable in Sanity (submitPage singleton). The page is a fixed
// sequence of named regions around the form button — intro, guidelines, button,
// contact line — so the layout holds and only the words change. The jargon
// essay link and the contact mailto are ordinary link marks inside the copy now,
// not special cases in this file.
export default async function SubmitPage() {
  const submit = await getSubmitContent();

  return (
    <main className={styles.root}>
      <Header active="Submit" />
      <div className={styles.reader}>
        <h1 className={styles.readerTitle}>{submit.pitchGuideTitle}</h1>

        <div className={styles.readerBody}>
          <PortableCopy value={submit.intro} />
        </div>

        {/* Guidelines come before the button: read what's expected, then pitch. */}
        <h2 className={styles.subhead}>{submit.guidelinesTitle}</h2>
        <p className={styles.subheadNote}>{submit.guidelinesIntro}</p>

        <PortableCopy value={submit.guidelines} variant="guidelines" />

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

        {/* Contact line last — it's for people the form doesn't serve. */}
        <div className={styles.readerBody}>
          <PortableCopy value={submit.outro} />
        </div>
      </div>
    </main>
  );
}
