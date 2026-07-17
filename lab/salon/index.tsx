"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Review } from "@/content/reviews";
import styles from "./styles.module.css";

type Phase = "enter" | "exit";

function View({ reviews }: { reviews: Review[] }) {
  const [active, setActive] = useState<Review | null>(null);
  const [phase, setPhase] = useState<Phase>("enter");

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  const reduced = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const openReview = useCallback(
    (review: Review, e: React.MouseEvent<HTMLButtonElement>) => {
      triggerRef.current = e.currentTarget;
      window.clearTimeout(closeTimer.current);
      setPhase("enter");
      setActive(review);
    },
    []
  );

  const closeReview = useCallback(() => {
    const restore = () => {
      setActive(null);
      // Return focus to the tile that opened the panel.
      triggerRef.current?.focus();
    };
    if (reduced()) {
      restore();
      return;
    }
    setPhase("exit");
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(restore, 240);
  }, []);

  // Lock body scroll + move focus into the panel while it is open.
  useEffect(() => {
    if (!active) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  // Clean up any pending exit timer on unmount.
  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const onDialogKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeReview();
      return;
    }
    if (e.key !== "Tab") return;
    const root = dialogRef.current;
    if (!root) return;
    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const current = document.activeElement;
    if (e.shiftKey) {
      if (current === first || current === root) {
        e.preventDefault();
        last.focus();
      }
    } else if (current === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>The Lab · The Broadway Art Ledger</p>
        <h1 className={styles.title}>Salon</h1>
        <p className={styles.lede}>
          The season, hung as a wall. Step up to any work to read it in full.
        </p>

        {/* ARCHIVE INTERFACE — designed locations, not wired. */}
        <div className={styles.tools}>
          <div className={styles.search} role="search">
            <svg
              className={styles.searchGlyph}
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" strokeLinecap="round" />
            </svg>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Search reviews…"
              aria-label="Search reviews"
              disabled
            />
          </div>

          <div className={styles.filters}>
            <div className={styles.chips} role="group" aria-label="Filter by section">
              <button
                type="button"
                className={`${styles.chip} ${styles.chipOn}`}
                aria-pressed="true"
                disabled
              >
                All
              </button>
            </div>
            <label className={styles.sort}>
              <span className={styles.sortLabel}>Sort</span>
              <select
                className={styles.sortSelect}
                defaultValue="newest"
                aria-label="Sort reviews"
                disabled
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="section">Section</option>
              </select>
            </label>
          </div>
        </div>
      </header>

      {reviews.length === 0 ? (
        <p className={styles.empty}>Nothing on the wall just yet.</p>
      ) : (
        <ul className={styles.wall}>
          {reviews.map((r, i) => (
            <li key={r.slug} className={styles.tile}>
              <button
                type="button"
                className={styles.work}
                aria-haspopup="dialog"
                onClick={(e) => openReview(r, e)}
              >
                <span className={styles.frame}>
                  <Image
                    className={styles.img}
                    src={r.image}
                    alt={r.alt}
                    fill
                    sizes="(max-width: 680px) 50vw, (max-width: 1320px) 33vw, 420px"
                    priority={i < 2}
                  />
                  <span className={styles.cue} aria-hidden="true">
                    Step up to read
                  </span>
                </span>
                <span className={styles.plaque}>
                  <span className={styles.pno}>{r.no}</span>
                  <span className={styles.pbody}>
                    <span className={styles.partist}>{r.artist}</span>
                    <span className={styles.ptitle}>{r.title}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {active && (
        <div
          className={styles.overlay}
          data-phase={phase}
          role="presentation"
          onMouseDown={(e) => {
            // Backdrop click closes; clicks inside the dialog do not.
            if (e.target === e.currentTarget) closeReview();
          }}
        >
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="salon-title"
            aria-describedby="salon-dek"
            tabIndex={-1}
            ref={dialogRef}
            onKeyDown={onDialogKeyDown}
          >
            <button
              type="button"
              className={styles.close}
              onClick={closeReview}
              aria-label="Close review"
            >
              <span aria-hidden="true">×</span>
            </button>

            <figure className={styles.media}>
              <span className={styles.mediaFrame}>
                <Image
                  className={styles.mediaImg}
                  src={active.image}
                  alt={active.alt}
                  fill
                  sizes="(max-width: 860px) 100vw, 560px"
                  priority
                />
              </span>
              <figcaption className={styles.artwork}>
                <span className={styles.artistName}>{active.artist}</span>
                <span className={styles.artworkTitle}>{active.artwork}</span>
              </figcaption>
            </figure>

            <div className={styles.read}>
              <div className={styles.readInner}>
                <p className={styles.reyebrow}>
                  <span className={styles.raccent}>{active.no}</span>
                </p>
                <h2 id="salon-title" className={styles.rtitle}>
                  {active.title}
                </h2>
                <p id="salon-dek" className={styles.rdek}>
                  {active.dek}
                </p>
                <p className={styles.rmeta}>
                  <span className={styles.rby}>{active.by}</span>
                  <span className={styles.rvenue}>
                    {active.exhibition} · {active.venue} · {active.date}
                  </span>
                </p>
                <div className={styles.rbody}>
                  {active.body.map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
                <p className={styles.credit}>{active.credit}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default View;
