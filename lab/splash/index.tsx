"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Review } from "@/content/reviews";
import { Mark } from "@/components/Mark";
import styles from "./styles.module.css";

/* ------------------------------------------------------------------ *
 * Splash — a kinetic masthead hero + a featured cover + a scroll feed.
 *
 * 1. HERO — the oversized Fraunces masthead ALONE: a small house mark, a
 *    mono kicker, and the two-line masthead ("The Broadway" / "Art [·]
 *    Ledger"), the two-squares house Mark set BETWEEN "Art" and "Ledger"
 *    as a vermilion accent. The hero is held shorter than the viewport
 *    (~82vh) so the COVER below peeks up from the bottom edge — the
 *    invitation to scroll. No image, no scroll arrow.
 *
 * 2. COVER — reviews[0] dressed as the campaign lockup: a big marquee
 *    image beside a "This Week's Cover" label, section·№, a big title,
 *    dek and byline; then the review's full body in a reading column.
 *    The image appears exactly once, in the lockup. This whole block is
 *    VISIBLE ON LOAD (no reveal-on-scroll hide) so it is already painted,
 *    peeking under the masthead.
 *
 * 3. FEED — reviews.slice(1) as alternating side-by-side sticky moments,
 *    revealed on scroll with a gentle parallax drift.
 * ------------------------------------------------------------------ */

// Reveal-on-scroll. Content is visible by default; the hidden→shown
// transition only exists under `prefers-reduced-motion: no-preference`
// (see CSS), so reduced-motion users always see everything in place.
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
      { threshold: 0.18, rootMargin: "0px 0px -12% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, inView };
}

// Gentle parallax drift. Writes a `--shift` custom property (px) onto
// the element; the CSS consumes it only when motion is allowed, so this
// is inert for reduced-motion users. rAF-gated, passive listeners.
function useParallax<T extends HTMLElement>(): React.RefObject<T | null> {
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
      const shift = progress * -22; // px of counter-drift
      el.style.setProperty("--shift", `${shift.toFixed(2)}px`);
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
      <span className={styles.metaSection}>{review.exhibition}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span>{review.venue}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span className={styles.metaDate}>{review.date}</span>
    </p>
  );
}

// One consistent feed composition: a side-by-side moment (image column +
// text column). The image side ALTERNATES by index for rhythm. The image
// column is sticky on desktop (see CSS) so the marquee plate stays in
// view while its text scrolls.
function Moment({ review, index }: { review: Review; index: number }) {
  const imageRight = index % 2 === 0;
  const { ref, inView } = useInView<HTMLElement>();
  const plateRef = useParallax<HTMLImageElement>();

  const className = [
    styles.moment,
    styles.reveal,
    inView ? styles.inView : "",
  ]
    .filter(Boolean)
    .join(" ");

  const gridClassName = [styles.splitGrid, imageRight ? styles.imgRight : styles.imgLeft].join(" ");

  return (
    <article ref={ref} className={className} data-side={imageRight ? "right" : "left"}>
      <div className={gridClassName}>
        <div className={styles.splitMedia}>
          <div className={styles.plate}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={plateRef} className={styles.plateImg} src={review.image} alt={review.alt} loading="lazy" />
          </div>
        </div>
        <div className={styles.splitText}>
          <p className={styles.sectionTag}>
            <span className={styles.no}>{review.no}</span>
          </p>
          <h2 className={styles.mTitle}>{review.title}</h2>
          <p className={styles.mDek}>{review.dek}</p>
          <div className={styles.reading}>
            <Meta review={review} />
            <p className={styles.byline}>By {review.by}</p>
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

// Hero — the masthead ALONE. A small house mark, a mono kicker, and the
// oversized two-line Fraunces masthead. The two-squares Mark sits BETWEEN
// "Art" and "Ledger" as a vermilion accent (not an ampersand, not a
// word). Words rise + fade in on load, staggered. The hero is held
// shorter than the viewport so the cover below peeks up — no scroll cue.
function Hero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <span className={styles.heroMark} aria-hidden="true">
          <Mark />
        </span>

        <p className={styles.kicker}>
          <span>The Lab</span>
          <span className={styles.kickerDot} aria-hidden="true">/</span>
          <span>Cover Story</span>
          <span className={styles.kickerDot} aria-hidden="true">/</span>
          <span>New York</span>
        </p>

        <h1 className={styles.masthead} aria-label="The Broadway Art Ledger">
          <span className={styles.word}>The</span>{" "}
          <span className={styles.word}>Broadway</span>
          <span className={styles.mastBreak} aria-hidden="true" />
          <span className={styles.word}>Art</span>{" "}
          <span className={`${styles.word} ${styles.mastMark}`} aria-hidden="true">
            <Mark />
          </span>{" "}
          <span className={styles.word}>Ledger</span>
        </h1>
      </div>
    </header>
  );
}

// Cover — reviews[0] as the campaign lockup (big marquee image beside the
// "This Week's Cover" label, section·№, big title, dek, byline), then the
// review's full body in a reading column. The image appears exactly once,
// in the lockup. Rendered WITHOUT the reveal-on-scroll hide, so it is
// painted on load and peeks up under the masthead.
function Cover({ review }: { review: Review }) {
  const mediaRef = useParallax<HTMLDivElement>();

  return (
    <section className={styles.cover} aria-labelledby="cover-title">
      <div className={styles.campaign}>
        <div className={styles.campaignMedia}>
          <div ref={mediaRef} className={styles.campaignImgWrap}>
            <Image
              className={styles.campaignImg}
              src={review.image}
              alt={review.alt}
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
              priority
            />
          </div>
        </div>

        <div className={styles.campaignText}>
          <p className={styles.campaignLabel}>
            <span className={styles.campaignLabelStar} aria-hidden="true">★</span>
            This Week&rsquo;s Cover
          </p>
          <p className={styles.campaignSection}>
            {review.no}
          </p>
          <h2 id="cover-title" className={styles.campaignTitle}>{review.title}</h2>
          <p className={styles.campaignDek}>{review.dek}</p>
          <p className={styles.campaignByline}>
            By {review.by} &nbsp;·&nbsp; {review.exhibition}, {review.venue}
          </p>
        </div>
      </div>

      <div className={styles.coverBody}>
        <Meta review={review} />
        <div className={styles.prose}>
          {review.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <p className={styles.credit}>{review.credit}</p>
      </div>
    </section>
  );
}

function View({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <main className={styles.page} />;
  }

  const [featured, ...rest] = reviews;

  return (
    <main className={styles.page}>
      {/* Masthead hero, then the featured cover (visible on load), then
          the rest of the reviews as the alternating scroll feed. */}
      <Hero />

      <Cover review={featured} />

      <div className={styles.stream}>
        {rest.map((review, i) => (
          <Moment key={review.slug} review={review} index={i} />
        ))}
      </div>

      <div className={styles.endMark}>
        <span className={styles.endAmp} aria-hidden="true"><Mark /></span>
        <p className={styles.endText}>The Broadway Art Ledger &nbsp;·&nbsp; The Lab</p>
      </div>

      <div className={styles.switcherClearance} aria-hidden="true" />
    </main>
  );
}

export default View;
