import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/site/Header";
import { PortableCopy } from "@/components/site/PortableCopy";
import { getAboutContent } from "@/lib/site-content";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "About — The Broadway Art Ledger" };

// About copy is editable in Sanity (aboutPage singleton), with content/site.ts
// as the fallback. Bryan's publication-name italics live in the copy itself now
// — as real emphasis marks — so there's no withEmphasis() string-splitting here.
export default async function AboutPage() {
  const about = await getAboutContent();

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

        <h1 className={styles.readerTitle}>{about.title}</h1>
        <div className={styles.readerBody}>
          <PortableCopy value={about.body} />
        </div>
      </div>
    </main>
  );
}
