"use client";

import { useEffect, useRef, useState } from "react";
import type { Review } from "@/content/reviews";
import styles from "./styles.module.css";

/* ------------------------------------------------------------------ *
 * Cutout — the giant title IS the window.
 * A sibling of Splash: same oversized-Fraunces energy, same paper
 * ground, boldness spent on type and scale rather than color. But
 * here the marquee artwork shows THROUGH the letterforms — the huge
 * heavy title is set with `background-clip: text`, so each review's
 * image fills its own name. The rhythm is: image-filled cutout cover
 * → the essay → the next cutout cover. As a title crosses the
 * viewport the image drifts inside the letters (desktop, motion on).
 * A graceful @supports fallback drops to a solid ink title with the
 * artwork on a plate beside it.
 * ------------------------------------------------------------------ */

// Reveal-on-scroll for the essays. Content is visible by default; the
// hidden→shown transition only exists under `prefers-reduced-motion:
// no-preference` (see CSS), so reduced-motion users see it all in place.
function useInView<T extends Element>(): { ref: React.RefObject<T | null>; inView: boolean } {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, inView };
}

// Scroll-linked pan of the image INSIDE the letters. Writes a `--bg-y`
// custom property (a %) onto the cutout title; the CSS consumes it only
// under `no-preference` (see the media block), so this is inert for
// reduced-motion users. rAF-gated, passive listeners; bails entirely
// when motion is reduced so no work is done at all.
function useTitlePan<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const center = rect.top + rect.height / 2;
      // -1 well below the fold … 0 centered … 1 well above it.
      const progress = Math.max(-1, Math.min(1, (center - vh / 2) / vh));
      // Pan the artwork within the glyphs: ~34% (title low) → ~66% (high).
      const y = 50 + progress * 16;
      el.style.setProperty("--bg-y", `${y.toFixed(2)}%`);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}

function Meta({ review }: { review: Review }) {
  return (
    <p className={styles.metaLine}>
      <span className={styles.metaSection}>{review.section}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span>{review.venue}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span>{review.hood}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span className={styles.metaDate}>{review.date}</span>
    </p>
  );
}

function ReviewMoment({ review, index }: { review: Review; index: number }) {
  const titleRef = useTitlePan<HTMLHeadingElement>();
  const { ref: essayRef, inView } = useInView<HTMLDivElement>();

  const essayClass = [styles.essay, styles.reveal, inView ? styles.inView : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={styles.moment}>
      {/* ---- the image-filled cutout cover ---- */}
      <section className={styles.cover} aria-labelledby={`title-${review.slug}`}>
        {index === 0 && (
          <p className={styles.kicker}>
            <span>The Lab</span>
            <span className={styles.kickerDot} aria-hidden="true">/</span>
            <span>Cutout</span>
            <span className={styles.kickerDot} aria-hidden="true">/</span>
            <span>New York</span>
          </p>
        )}

        <p className={styles.coverLabel}>
          <span className={styles.no}>{review.no}</span>
          <span className={styles.labelDot} aria-hidden="true">·</span>
          <span>{review.section}</span>
        </p>

        <div className={styles.titleWrap}>
          {/* The artwork fills the letterforms via background-clip: text.
              The URL is data, so it rides in on an inline custom prop. */}
          <h2
            ref={titleRef}
            id={`title-${review.slug}`}
            className={styles.cutoutTitle}
            style={{ ["--img" as string]: `url("${review.image}")` }}
          >
            {review.title}
          </h2>

          {/* Fallback plate: hidden unless the browser lacks
              background-clip:text (see @supports-not block in CSS). */}
          <div className={styles.fallbackPlate} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={styles.fallbackImg} src={review.image} alt="" loading="lazy" />
          </div>
        </div>

        <p className={styles.coverDek}>{review.dek}</p>

        {index === 0 && (
          <p className={styles.scrollCue} aria-hidden="true">
            Scroll <span className={styles.scrollArrow}>↓</span>
          </p>
        )}
      </section>

      {/* ---- the essay ---- */}
      <div ref={essayRef} className={essayClass}>
        <div className={styles.essayInner}>
          <div className={styles.essayHead}>
            <h3 className={styles.essayTitle}>{review.title}</h3>
            <Meta review={review} />
            <p className={styles.byline}>By {review.by}</p>
          </div>

          <div className={styles.essayBody}>
            <figure className={styles.plate}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.plateImg} src={review.image} alt={review.alt} loading="lazy" />
              <figcaption className={styles.plateCap}>
                {review.artist} — <span className={styles.plateArtwork}>{review.artwork}</span>
              </figcaption>
            </figure>

            <div className={styles.prose}>
              {review.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <p className={styles.credit}>{review.credit}</p>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function View({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <main className={styles.page} />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.stream}>
        {reviews.map((review, i) => (
          <ReviewMoment key={review.slug} review={review} index={i} />
        ))}
      </div>

      <div className={styles.endMark}>
        <span className={styles.endAmp} aria-hidden="true">&amp;</span>
        <p className={styles.endText}>The Broadway Art &amp; Ledger &nbsp;·&nbsp; The Lab</p>
      </div>

      <div className={styles.switcherClearance} aria-hidden="true" />
    </main>
  );
}
