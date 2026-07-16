"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Review } from "@/content/reviews";
import styles from "./styles.module.css";

function View({ reviews }: { reviews: Review[] }) {
  const hallRef = useRef<HTMLDivElement>(null);
  const shotRefs = useRef<Array<HTMLDivElement | null>>([]);
  const reducedRef = useRef(false);
  const rafRef = useRef(0);

  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  const count = reviews.length + 1; // intro + reviews

  // Track reduced-motion preference (drives parallax on/off).
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      reducedRef.current = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Read scroll position → progress, active room, and per-panel parallax.
  const update = useCallback(() => {
    const hall = hallRef.current;
    if (!hall) return;

    const horizRange = hall.scrollWidth - hall.clientWidth;
    const vertRange = hall.scrollHeight - hall.clientHeight;
    const horiz = horizRange > vertRange;

    const max = horiz ? horizRange : vertRange;
    const pos = horiz ? hall.scrollLeft : hall.scrollTop;
    const p = max > 1 ? Math.min(1, Math.max(0, pos / max)) : 0;

    setProgress(p);
    setActive(Math.round(p * (count - 1)));

    // Subtle parallax: nudge each image against the walk as its panel passes.
    if (horiz && !reducedRef.current) {
      const vw = hall.clientWidth || 1;
      for (const el of shotRefs.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const c = (r.left + r.width / 2 - vw / 2) / vw; // ~ -1 .. 1
        el.style.setProperty("--shift", `${(c * 22).toFixed(2)}px`);
      }
    } else {
      for (const el of shotRefs.current) el?.style.setProperty("--shift", "0px");
    }
  }, [count]);

  // Native scroll + resize listeners (rAF-throttled).
  useEffect(() => {
    const hall = hallRef.current;
    if (!hall) return;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        update();
      });
    };
    hall.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      hall.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [update]);

  // Translate vertical wheel into a sideways walk (mouse-wheel users).
  // Non-passive so preventDefault holds. Yields to nested vertical reading
  // regions, and no-ops in the mobile vertical layout.
  useEffect(() => {
    const hall = hallRef.current;
    if (!hall) return;
    const onWheel = (e: WheelEvent) => {
      const horiz = hall.scrollWidth - hall.clientWidth > 1;
      if (!horiz) return; // vertical / mobile: let the browser scroll natively

      const target = e.target as HTMLElement | null;
      const col = target?.closest?.("[data-read]") as HTMLElement | null;
      if (col) {
        const canDown =
          e.deltaY > 0 && col.scrollTop + col.clientHeight < col.scrollHeight - 1;
        const canUp = e.deltaY < 0 && col.scrollTop > 0;
        if (canDown || canUp) return; // reader is scrolling the wall label
      }

      if (Math.abs(e.deltaY) >= Math.abs(e.deltaX) && e.deltaY !== 0) {
        hall.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    hall.addEventListener("wheel", onWheel, { passive: false });
    return () => hall.removeEventListener("wheel", onWheel);
  }, []);

  // On-screen prev/next: advance one panel along the current axis.
  const step = useCallback((dir: 1 | -1) => {
    const hall = hallRef.current;
    if (!hall) return;
    const horiz = hall.scrollWidth - hall.clientWidth > 1;
    const panel = hall.querySelector("[data-panel]") as HTMLElement | null;
    const size = panel
      ? horiz
        ? panel.offsetWidth
        : panel.offsetHeight
      : horiz
        ? hall.clientWidth
        : hall.clientHeight;
    const behavior: ScrollBehavior = reducedRef.current ? "auto" : "smooth";
    if (horiz) hall.scrollBy({ left: dir * size, behavior });
    else hall.scrollBy({ top: dir * size, behavior });
  }, []);

  const atStart = progress <= 0.001;
  const atEnd = progress >= 0.999;

  return (
    <main className={styles.root}>
      <div
        className={styles.hall}
        ref={hallRef}
        role="region"
        aria-label="Promenade — a gallery walk through the reviews"
        tabIndex={0}
      >
        {/* Intro — a composed entrance to the hall. */}
        <section className={styles.intro} data-panel aria-label="Promenade — introduction">
          <p className={styles.eyebrow}>The Lab · Broadway Art Ledger</p>
          <h1 className={styles.introTitle}>Promenade</h1>
          <p className={styles.introLede}>
            A gallery walk. Move sideways, room to room, through paintings, prints{" "}
            <span className={styles.amp}>&amp;</span> photographs — each work hung beside its
            wall label. On a phone, the hall tips upright into a vertical stroll.
          </p>
          <p className={styles.introMeta}>
            <span className={styles.introCount}>{reviews.length}</span> works · scroll to begin
          </p>
          <span className={styles.cue} aria-hidden="true" />
        </section>

        {reviews.map((r, i) => (
          <section
            key={r.slug}
            className={styles.panel}
            data-panel
            aria-label={`${r.title} — reviewed by ${r.by}`}
          >
            <span className={styles.roomNo} aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>

            <figure className={styles.frame}>
              <div
                className={styles.shot}
                ref={(el) => {
                  shotRefs.current[i] = el;
                }}
              >
                {/* Marquee image — every review has one. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.img}
                  src={r.image}
                  alt={r.alt}
                  loading={i < 2 ? "eager" : "lazy"}
                  draggable={false}
                />
              </div>
              <figcaption className={styles.cap}>
                <span className={styles.capArtist}>{r.artist}</span>
                <span className={styles.capWork}>{r.artwork}</span>
              </figcaption>
            </figure>

            <div className={styles.label} data-read>
              <div className={styles.meta}>
                <span className={styles.section}>{r.section}</span>
                <span className={styles.dot} aria-hidden="true">
                  ·
                </span>
                <span>{r.venue}</span>
                <span className={styles.dot} aria-hidden="true">
                  ·
                </span>
                <span>{r.hood}</span>
                <span className={styles.dot} aria-hidden="true">
                  ·
                </span>
                <span>{r.date}</span>
                <span className={styles.no}>{r.no}</span>
              </div>

              <h2 className={styles.title}>{r.title}</h2>
              <p className={styles.dek}>{r.dek}</p>
              <p className={styles.by}>By {r.by}</p>

              <div className={styles.body}>
                {r.body.map((para, pi) => (
                  <p key={pi}>{para}</p>
                ))}
              </div>

              <p className={styles.credit}>{r.credit}</p>
            </div>
          </section>
        ))}
      </div>

      {/* Side controls — hidden in the mobile vertical layout via CSS. */}
      <button
        type="button"
        className={`${styles.nav} ${styles.navPrev}`}
        onClick={() => step(-1)}
        disabled={atStart}
        aria-label="Previous room"
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        type="button"
        className={`${styles.nav} ${styles.navNext}`}
        onClick={() => step(1)}
        disabled={atEnd}
        aria-label="Next room"
      >
        <span aria-hidden="true">→</span>
      </button>

      {/* Fixed progress rail along the bottom of the walk. */}
      <div className={styles.rail} role="presentation">
        <span className={styles.railCount}>
          {String(active + 1).padStart(2, "0")}
          <span className={styles.railSlash}>/</span>
          {String(count).padStart(2, "0")}
        </span>
        <span className={styles.track}>
          <span
            className={styles.fill}
            style={{ transform: `scaleX(${Math.max(0.02, progress)})` }}
          />
        </span>
        <span className={styles.railHint}>the walk</span>
      </div>
    </main>
  );
}

export default View;
