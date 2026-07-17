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
  const img = about.image;

  return (
    <main className={styles.root}>
      <Header active="About" />
      <div className={styles.reader}>
        {/* The About image comes from Sanity. Capped at its own natural width
            (up to the column) so a low-res source never upscales, and simply
            omitted when none is set. Decorative: the statement carries the
            meaning. */}
        {img && (
          <figure className={styles.aboutFig} style={{ maxWidth: Math.min(img.width, 700) }}>
            <Image
              className={styles.aboutImg}
              src={img.url}
              alt={img.alt}
              width={img.width}
              height={img.height}
              sizes="(max-width: 760px) 100vw, 700px"
              priority
            />
          </figure>
        )}

        <h1 className={styles.readerTitle}>{about.title}</h1>
        <div className={styles.readerBody}>
          <PortableCopy value={about.body} />
        </div>
      </div>
    </main>
  );
}
