"use client";

import { useEffect, useRef, useState } from "react";
import type { Review } from "@/content/reviews";
import styles from "./styles.module.css";

/* ------------------------------------------------------------------ *
 * Splash — a kinetic masthead + scroll-choreographed cover story.
 * The first screen is a magazine-cover MOMENT (oversized Fraunces
 * masthead rising in on load, the newest review dressed as the
 * campaign hero). Everything after is choreographed by scroll:
 * each review arrives as a large editorial moment, compositions
 * alternating for rhythm, revealed via IntersectionObserver with a
 * gentle parallax drift on the big plates.
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

// One consistent composition: a side-by-side moment (image column +
// text column). The image side ALTERNATES by index for rhythm — the
// first full moment (index 0, the cover) puts art on the right, the
// next on the left, and so on. The image column is sticky on desktop
// (see CSS) so the marquee plate stays in view while its text scrolls.
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
            <span>{review.section}</span>
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

function Hero({ featured }: { featured: Review }) {
  const imgRef = useParallax<HTMLImageElement>();

  return (
    <header className={styles.hero}>
      <p className={styles.kicker}>
        <span>The Lab</span>
        <span className={styles.kickerDot} aria-hidden="true">/</span>
        <span>Cover Story</span>
        <span className={styles.kickerDot} aria-hidden="true">/</span>
        <span>New York</span>
      </p>

      <h1 className={styles.masthead} aria-label="The Broadway Art & Ledger">
        <span className={styles.word}>The</span>{" "}
        <span className={styles.word}>Broadway</span>
        <span className={styles.mastBreak} aria-hidden="true" />
        <span className={styles.word}>Art</span>{" "}
        <span className={`${styles.word} ${styles.amp}`} aria-hidden="true">&amp;</span>{" "}
        <span className={styles.word}>Ledger</span>
      </h1>

      <div className={styles.campaign}>
        <div className={styles.campaignMedia}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} className={styles.campaignImg} src={featured.image} alt={featured.alt} />
        </div>

        <div className={styles.campaignText}>
          <p className={styles.campaignLabel}>
            <span className={styles.campaignLabelStar} aria-hidden="true">★</span>
            This Week&rsquo;s Cover
          </p>
          <p className={styles.campaignSection}>
            {featured.no} &nbsp;·&nbsp; {featured.section}
          </p>
          <h2 className={styles.campaignTitle}>{featured.title}</h2>
          <p className={styles.campaignDek}>{featured.dek}</p>
          <p className={styles.campaignByline}>
            By {featured.by} &nbsp;·&nbsp; {featured.venue}, {featured.hood}
          </p>
          <p className={styles.scrollCue} aria-hidden="true">
            Scroll <span className={styles.scrollArrow}>↓</span>
          </p>
        </div>
      </div>
    </header>
  );
}

function View({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return <main className={styles.page} />;
  }

  const [featured] = reviews;

  return (
    <main className={styles.page}>
      <Hero featured={featured} />

      {/* The cover (reviews[0]) intentionally reappears here as the first
          full feed moment: the "This Week's Cover" teaser scrolls into
          the cover review in full, then reviews[1], reviews[2], … */}
      <div className={styles.stream}>
        {reviews.map((review, i) => (
          <Moment key={review.slug} review={review} index={i} />
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

export default View;
