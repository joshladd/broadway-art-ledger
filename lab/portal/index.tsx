"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { Review } from "@/content/reviews";
import { Mark } from "@/components/Mark";
import styles from "./styles.module.css";

/* ------------------------------------------------------------------ *
 * Portal — a gallery of magazine covers that ZOOM OPEN into the essay.
 *
 * Landing: every review dressed as a "cover" (marquee image + oversized
 * Fraunces title + №·section), a considered grid on desktop, a single
 * stack on mobile. Tap a cover and its image performs a shared-element
 * PORTAL transition — measured from its rect (getBoundingClientRect)
 * and animated to fullscreen via a FLIP transform — becoming the
 * reading backdrop while the full essay fades in over a paper panel.
 * Close zooms the image back down into its slot in the gallery.
 *
 * The zoom IS the signature. Body scroll is locked while a portal is
 * open, focus moves into the article and returns to the card on close,
 * and Escape closes. Under prefers-reduced-motion the portal opens and
 * closes instantly — no zoom — and stays fully usable.
 * ------------------------------------------------------------------ */

type Mode = "idle" | "enter" | "shown" | "exit";

// The FLIP "collapsed" transform: maps the fullscreen stage back onto the
// clicked cover's rect. transform-origin is the top-left corner (0 0), so a
// translate+scale lands the stage exactly over the thumbnail.
function collapsedTransform(rect: DOMRect): string {
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  const sx = rect.width / vw;
  const sy = rect.height / vh;
  return `translate(${rect.left}px, ${rect.top}px) scale(${sx}, ${sy})`;
}

function Meta({ review, light }: { review: Review; light?: boolean }) {
  return (
    <p className={light ? styles.metaLineLight : styles.metaLine}>
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

function View({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState<Review | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [collapsed, setCollapsed] = useState<string>("none");

  // Motion preference, read once on the client. Reduced-motion users skip the
  // zoom entirely (open/close are instant) — see also the CSS media query.
  const reduce = useRef(false);

  // The cover the portal grew from — for geometry (open) and focus (close).
  const mediaRefs = useRef<Map<string, HTMLElement>>(new Map());
  const lastCardRef = useRef<HTMLButtonElement | null>(null);

  const overlayRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const scrollbarPad = useRef(0);

  // Section chips are a DESIGNED (inert) filter slot — sections are derived
  // from the collection so the chips read as real, but nothing is wired.
  const sections = useMemo(() => {
    const seen: string[] = [];
    for (const r of reviews) if (r.section && !seen.includes(r.section)) seen.push(r.section);
    return seen;
  }, [reviews]);

  useEffect(() => {
    if (typeof window.matchMedia === "function") {
      reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }, []);

  const lockScroll = useCallback(() => {
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    scrollbarPad.current = sbw;
    document.body.style.overflow = "hidden";
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`;
  }, []);

  const unlockScroll = useCallback(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, []);

  const finish = useCallback(() => {
    setActive(null);
    setMode("idle");
    setCollapsed("none");
    unlockScroll();
    // Return focus to the cover that opened the portal.
    const card = lastCardRef.current;
    if (card) requestAnimationFrame(() => card.focus());
  }, [unlockScroll]);

  const open = useCallback(
    (review: Review, card: HTMLButtonElement) => {
      const media = mediaRefs.current.get(review.slug);
      if (!media) return;
      const rect = media.getBoundingClientRect();
      lastCardRef.current = card;
      setCollapsed(collapsedTransform(rect));
      lockScroll();
      setActive(review);
      setMode(reduce.current ? "shown" : "enter");
    },
    [lockScroll]
  );

  const close = useCallback(() => {
    if (reduce.current) {
      finish();
      return;
    }
    setMode("exit");
  }, [finish]);

  // ENTER: the stage mounts in its collapsed (thumbnail) state; a double rAF
  // lets that paint, then we release to "shown" so the CSS transition runs the
  // zoom up to fullscreen.
  useLayoutEffect(() => {
    if (mode !== "enter") return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setMode("shown"));
    });
    return () => {
      cancelAnimationFrame(r1);
      if (r2) cancelAnimationFrame(r2);
    };
  }, [mode]);

  // Once open, move focus into the article so keyboard users land inside it.
  useEffect(() => {
    if (mode === "shown") scrollerRef.current?.focus();
  }, [mode]);

  // Escape closes; Tab is trapped inside the open portal.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const root = overlayRef.current;
      if (!root) return;
      const list = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const cur = document.activeElement;
      if (e.shiftKey) {
        if (cur === first || !root.contains(cur)) {
          e.preventDefault();
          last.focus();
        }
      } else if (cur === last || !root.contains(cur)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, close]);

  const onStageTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.target === stageRef.current && e.propertyName === "transform" && mode === "exit") {
        finish();
      }
    },
    [mode, finish]
  );

  if (reviews.length === 0) {
    return <main className={styles.page} />;
  }

  // Collapsed transform is applied while entering and exiting; "none" once open.
  const stageTransform = mode === "shown" ? "none" : collapsed;

  return (
    <main className={styles.page}>
      <header className={styles.masthead}>
        <p className={styles.kicker}>
          <span>The Lab</span>
          <span className={styles.kickerDot} aria-hidden="true">/</span>
          <span>Portal</span>
          <span className={styles.kickerDot} aria-hidden="true">/</span>
          <span>New York</span>
        </p>
        <h1 className={styles.wordmark} aria-label="The Broadway Art Ledger">
          <span className={styles.word}>The</span>{" "}
          <span className={styles.word}>Broadway</span>
          <span className={styles.wordBreak} aria-hidden="true" />
          <span className={styles.word}>Art</span>{" "}
          <span className={styles.word}>Ledger</span>
        </h1>
        <p className={styles.intro}>
          A gallery of covers. Tap one and it opens — the picture zooms up to
          become the page you read.
        </p>
      </header>

      {/* ARCHIVE INTERFACE — designed slots, deliberately inert (not wired). */}
      <div className={styles.tools}>
        <div className={styles.search} role="search">
          <span className={styles.searchGlyph} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            className={styles.searchInput}
            placeholder="Search reviews…"
            aria-label="Search reviews"
            disabled
          />
        </div>

        <div className={styles.filters}>
          <div className={styles.chips} role="group" aria-label="Filter by section">
            <button type="button" className={`${styles.chip} ${styles.chipOn}`} aria-pressed="true" disabled>
              All
            </button>
            {sections.map((s) => (
              <button key={s} type="button" className={styles.chip} aria-pressed="false" disabled>
                {s}
              </button>
            ))}
          </div>
          <label className={styles.sort}>
            <span className={styles.sortLabel}>Sort</span>
            <select className={styles.sortSelect} defaultValue="newest" aria-label="Sort reviews" disabled>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="section">Section</option>
            </select>
          </label>
        </div>
      </div>

      <section className={styles.gallery} aria-label="Reviews">
        {reviews.map((review, i) => (
          <button
            key={review.slug}
            type="button"
            className={styles.card}
            data-featured={i === 0 ? "true" : undefined}
            aria-label={`Open ${review.title}`}
            onClick={(e) => open(review, e.currentTarget)}
          >
            <span
              className={styles.cardMedia}
              ref={(el) => {
                if (el) mediaRefs.current.set(review.slug, el);
                else mediaRefs.current.delete(review.slug);
              }}
            >
              <Image
                className={styles.cardImg}
                src={review.image}
                alt={review.alt}
                fill
                sizes={i === 0 ? "100vw" : "(max-width: 860px) 100vw, 33vw"}
                priority={i < 3}
              />
              <span className={styles.cardScrim} aria-hidden="true" />
            </span>
            <span className={styles.cardText}>
              <span className={styles.cardLabel}>
                <span className={styles.no}>{review.no}</span>
                <span className={styles.cardLabelSep} aria-hidden="true">·</span>
                <span>{review.section}</span>
              </span>
              <span className={styles.cardTitle}>{review.title}</span>
              <span className={styles.cardCta} aria-hidden="true">
                Open <span className={styles.cardCtaGlyph}>↗</span>
              </span>
            </span>
          </button>
        ))}
      </section>

      <div className={styles.endMark}>
        <span className={styles.endAmp} aria-hidden="true"><Mark /></span>
        <p className={styles.endText}>
          <span className={styles.markInline}><Mark /></span> The Broadway Art Ledger &nbsp;·&nbsp; The Lab
        </p>
      </div>

      <div className={styles.switcherClearance} aria-hidden="true" />

      {active && (
        <div
          className={styles.overlay}
          data-mode={mode}
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="portal-title"
        >
          {/* The shared element: the cover image, grown to fill the screen. */}
          <div
            className={styles.stage}
            ref={stageRef}
            style={{ transform: stageTransform }}
            onTransitionEnd={onStageTransitionEnd}
            aria-hidden="true"
          >
            <Image className={styles.stageImg} src={active.image} alt="" fill sizes="100vw" priority />
            <span className={styles.stageScrim} />
          </div>

          <button type="button" className={styles.close} onClick={close} aria-label="Close review">
            <span className={styles.closeGlyph} aria-hidden="true">×</span>
            <span className={styles.closeText}>Close</span>
          </button>

          <div className={styles.scroller} ref={scrollerRef} tabIndex={0}>
            <article className={styles.article}>
              <header className={styles.lede}>
                <p className={styles.ledeLabel}>
                  <span className={styles.no}>{active.no}</span>
                  <span className={styles.cardLabelSep} aria-hidden="true">·</span>
                  <span>{active.section}</span>
                </p>
                <h2 id="portal-title" className={styles.ledeTitle}>
                  {active.title}
                </h2>
                <p className={styles.ledeDek}>{active.dek}</p>
                <Meta review={active} light />
                <p className={styles.ledeByline}>By {active.by}</p>
                <p className={styles.scrollCue} aria-hidden="true">
                  Read <span className={styles.scrollArrow}>↓</span>
                </p>
              </header>

              <div className={styles.panel}>
                <div className={styles.prose}>
                  {active.body.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <p className={styles.credit}>{active.credit}</p>
                <p className={styles.panelMeta}>
                  {active.artist} &mdash; <span className={styles.panelArtwork}>{active.artwork}</span>
                </p>
              </div>
            </article>
          </div>
        </div>
      )}
    </main>
  );
}

export default View;
