"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Review } from "@/content/reviews";
import Image from "next/image";
import { Mark } from "@/components/Mark";
import styles from "./styles.module.css";

/* ------------------------------------------------------------------ *
 * Stacks — the ARCHIVE as a wall of risograph STACKED CARDS.
 *
 * Each review is printed as a two-ink card: a duotone marquee plate
 * (blue + warm-red inks, off-register), an oversized Fraunces title,
 * its № · section · venue, sitting on a chunky OFFSET stacked shadow
 * (box-shadow: Xpx Ypx 0 <ink>). Tap a card and it performs a
 * shared-element PORTAL zoom — measured from its rect
 * (getBoundingClientRect) and animated to a fullscreen reading view
 * via a FLIP transform — where the full review is read over the
 * enlarged plate. Close zooms the card back into its slot.
 *
 * The archive header carries a masthead (kicker + big "Stacks" + a
 * count line) and DESIGNED-BUT-INERT search & filter slots.
 *
 * Body scroll locks while a card is open; focus moves into the article
 * and returns to the card on close; Escape closes. Under
 * prefers-reduced-motion the open/close is instant (no zoom) and the
 * view stays fully usable.
 * ------------------------------------------------------------------ */

type Mode = "idle" | "enter" | "shown" | "exit";

// The FLIP "collapsed" transform: maps the fullscreen stage back onto the
// tapped card's rect. transform-origin is the top-left corner (0 0), so a
// translate+scale lands the stage exactly over the card.
function collapsedTransform(rect: DOMRect): string {
  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  const sx = rect.width / vw;
  const sy = rect.height / vh;
  return `translate(${rect.left}px, ${rect.top}px) scale(${sx}, ${sy})`;
}

export default function View({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState<Review | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [collapsed, setCollapsed] = useState<string>("none");

  // Motion preference, read once on the client. Reduced-motion users skip the
  // zoom entirely (open/close are instant) — see also the CSS media query.
  const reduce = useRef(false);

  // The card the portal grew from — for geometry (open) and focus (close).
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
    // Return focus to the card that opened the portal.
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

  // ENTER: the stage mounts in its collapsed (card) state; a double rAF lets
  // that paint, then we release to "shown" so the CSS transition runs the zoom
  // up to fullscreen.
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

  // Escape closes; Tab is trapped inside the open portal. We deliberately do
  // NOT handle ArrowLeft/ArrowRight — the Lab switcher owns those.
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
        root.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')
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
          <span>Archive</span>
          <span className={styles.kickerDot} aria-hidden="true">/</span>
          <span>Stacks</span>
        </p>
        <h1 className={styles.title}>Stacks</h1>
        <p className={styles.count}>
          <span className={styles.countNum}>{reviews.length}</span> reviews, printed in two inks —
          newest on top. Tap a card to open it.
        </p>

        {/* ARCHIVE INTERFACE — designed locations, not wired. */}
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
            />
          </div>

          <div className={styles.filters}>
            <div className={styles.chips} role="group" aria-label="Filter by section">
              <button type="button" className={`${styles.chip} ${styles.chipOn}`} aria-pressed="true">
                All
              </button>
              {sections.map((s) => (
                <button key={s} type="button" className={styles.chip} aria-pressed="false">
                  {s}
                </button>
              ))}
            </div>
            <label className={styles.sort}>
              <span className={styles.sortLabel}>Sort</span>
              <select className={styles.sortSelect} defaultValue="newest" aria-label="Sort reviews">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="section">Section</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      <section className={styles.stack} aria-label="Reviews">
        {reviews.map((review) => (
          <button
            key={review.slug}
            type="button"
            className={styles.card}
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
              <span className={styles.duo}>
                <Image
                  className={styles.cardImg}
                  src={review.image}
                  alt={review.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                />
              </span>
            </span>
            <span className={styles.cardBody}>
              <span className={styles.cardMeta}>
                <span className={styles.no}>{review.no}</span>
                <span className={styles.metaSep} aria-hidden="true">·</span>
                <span className={styles.section}>{review.section}</span>
              </span>
              <span className={styles.cardTitle}>{review.title}</span>
              <span className={styles.cardVenue}>{review.venue}</span>
              <span className={styles.cardCta} aria-hidden="true">
                Open <span className={styles.cardCtaGlyph}>↗</span>
              </span>
            </span>
          </button>
        ))}
      </section>

      <div className={styles.colophon}>
        <span className={styles.colophonMark} aria-hidden="true">▚</span>
        <p className={styles.colophonText}>
          <span className={styles.markInline}><Mark /></span> The Broadway Art Ledger &nbsp;·&nbsp; Printed in two inks
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
          aria-labelledby="stacks-title"
        >
          {/* The shared element: the card plate grown to fill the screen. */}
          <div
            className={styles.stage}
            ref={stageRef}
            style={{ transform: stageTransform }}
            onTransitionEnd={onStageTransitionEnd}
            aria-hidden="true"
          >
            <span className={styles.duo}>
              <Image className={styles.stageImg} src={active.image} alt="" fill sizes="100vw" priority />
            </span>
            <span className={styles.stageScrim} />
          </div>

          <button type="button" className={styles.close} onClick={close} aria-label="Close review">
            <span className={styles.closeGlyph} aria-hidden="true">×</span>
            <span className={styles.closeText}>Close</span>
          </button>

          <div className={styles.scroller} ref={scrollerRef} tabIndex={0}>
            <article className={styles.article}>
              <header className={styles.lede}>
                <p className={styles.ledeMeta}>
                  <span className={styles.no}>{active.no}</span>
                  <span className={styles.metaSep} aria-hidden="true">·</span>
                  <span>{active.section}</span>
                  <span className={styles.metaSep} aria-hidden="true">·</span>
                  <span>{active.date}</span>
                </p>
                <h2 id="stacks-title" className={styles.ledeTitle}>
                  {active.title}
                </h2>
                <p className={styles.ledeDek}>{active.dek}</p>
                <p className={styles.ledeVenue}>
                  {active.venue}, {active.hood}
                </p>
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
