import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/site/Header";
import { aboutStatement, PUBLICATION } from "@/content/site";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "About — The Broadway Art Ledger" };

// Bryan italicizes the publication's name in his running prose (CMOS for a
// publication title). Reproduce that rather than flattening his formatting.
function withEmphasis(text: string): React.ReactNode {
  const parts = text.split(PUBLICATION);
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) =>
    i === 0 ? [part] : [<em key={i}>{PUBLICATION}</em>, part],
  );
}

export default function AboutPage() {
  return (
    <main className={styles.root}>
      <Header active="About" />
      <div className={styles.reader}>
        {/* Bryan explicitly asked for this image on the About page. It is only
            447px wide, so the figure is capped at natural size (see CSS) rather
            than upscaled across the column. Decorative: the statement beside it
            carries the meaning. */}
        <figure className={styles.aboutFig}>
          <Image
            className={styles.aboutImg}
            src="/about.png"
            alt=""
            width={447}
            height={298}
            sizes="447px"
            priority
          />
        </figure>

        <h1 className={styles.readerTitle}>{aboutStatement.title}</h1>
        <div className={styles.readerBody}>
          {aboutStatement.body.map((p, i) => (
            <p key={i}>{withEmphasis(p)}</p>
          ))}
        </div>
      </div>
    </main>
  );
}
