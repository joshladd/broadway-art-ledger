import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import {
  submitGuide,
  SUBMIT_FORM_URL,
  CONTACT_EMAIL,
  JARGON_ESSAY_URL,
} from "@/content/site";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "Submit — The Broadway Art Ledger" };

// This epic does NOT build our own form. /submit is Bryan's copy plus a link to
// the Airtable form he already built, so writers can pitch today. Our own form
// is blocked on him converting `Writer Email` from an aiText field — and we do
// not work around that by folding the email into the pitch body, because his
// guidelines forbid identifying information inside a pitch.
export default function SubmitPage() {
  const JARGON_BULLET = "Avoid making your piece read like a press release, and avoid jargon.";

  return (
    <main className={styles.root}>
      <Header active="Submit" />
      <div className={styles.reader}>
        <h1 className={styles.readerTitle}>{submitGuide.pitchGuideTitle}</h1>

        <div className={styles.readerBody}>
          {submitGuide.intro.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {/* Outbound handoff to Bryan's Airtable form. New tab: it's a different
            product, and a writer shouldn't hit a dead end. */}
        <a
          className={styles.formLink}
          href={SUBMIT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open the pitch form
        </a>

        <h2 className={styles.subhead}>{submitGuide.guidelinesTitle}</h2>
        <p className={styles.subheadNote}>{submitGuide.guidelinesIntro}</p>

        <ul className={styles.guidelines}>
          {submitGuide.guidelines.map((g) => (
            <li key={g}>
              {g}
              {/* Bryan hyperlinks the International Art English essay from this
                  guideline in his source. */}
              {g === JARGON_BULLET && (
                <>
                  {" ("}
                  <a href={JARGON_ESSAY_URL} target="_blank" rel="noopener noreferrer">
                    This essay
                  </a>
                  {" on International Art English is a great reference point.)"}
                </>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.readerBody}>
          <p>
            {submitGuide.outro.before}{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
            {submitGuide.outro.after}
          </p>
        </div>
      </div>
    </main>
  );
}
