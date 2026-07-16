"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Review } from "@/content/reviews";
import styles from "./styles.module.css";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => v * v * (3 - 2 * v); // smoothstep easing
const pad2 = (n: number) => String(n).padStart(2, "0");

function View({ reviews }: { reviews: Review[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const ticking = useRef(false);
  const lastIdx = useRef(0);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  const total = reviews.length;

  // Track the reduced-motion preference so we can drop the parallax/peel work.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Per-frame: write each card's scroll-driven --enter (incoming parallax) and
  // --leave (outgoing recede) as CSS custom properties, and surface the index.
  const update = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const h = scroller.clientHeight || 1;
    const pos = scroller.scrollTop / h; // fractional card index
    const cards = cardRefs.current;
    for (let i = 0; i < cards.length; i++) {
      const el = cards[i];
      if (!el) continue;
      if (reduced) {
        el.style.setProperty("--enter", "1");
        el.style.setProperty("--leave", "0");
      } else {
        const enter = smooth(clamp01(pos - (i - 1))); // 0 → 1 as card slides in
        const leave = smooth(clamp01(pos - i)); //         0 → 1 as card is covered
        el.style.setProperty("--enter", enter.toFixed(4));
        el.style.setProperty("--leave", leave.toFixed(4));
      }
    }
    const idx = Math.min(total - 1, Math.max(0, Math.round(pos)));
    if (idx !== lastIdx.current) {
      lastIdx.current = idx;
      setActive(idx);
    }
  }, [reduced, total]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        ticking.current = false;
        update();
      });
    };
    update();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [update]);

  const goTo = useCallback(
    (i: number) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      scroller.scrollTo({
        top: i * scroller.clientHeight,
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [reduced]
  );

  return (
    <main className={styles.root}>
      <div className={styles.scroller} ref={scrollerRef}>
        {reviews.map((r, i) => (
          <article
            key={r.slug}
            className={styles.card}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            aria-label={`Review ${i + 1} of ${total}: ${r.title}`}
          >
            <div className={styles.stage}>
              <div className={styles.inner}>
                <div className={styles.marquee}>
                  <img
                    className={styles.img}
                    src={r.image}
                    alt={r.alt}
                    loading={i < 2 ? "eager" : "lazy"}
                    draggable={false}
                  />
                  <div className={styles.scrim} aria-hidden="true" />
                  <div className={styles.kicker}>
                    <span className={styles.no}>{r.no}</span>
                    <span className={styles.section}>{r.section}</span>
                    <span className={styles.date}>{r.date}</span>
                  </div>
                  <h2 className={styles.title}>{r.title}</h2>
                </div>

                <div className={styles.readout}>
                  <p className={styles.dek}>{r.dek}</p>
                  <div className={styles.rule} aria-hidden="true" />
                  <div className={styles.byline}>
                    <span className={styles.by}>{r.by}</span>
                    <span className={styles.place}>
                      {r.venue} · {r.hood}
                    </span>
                  </div>
                  <div className={styles.body}>
                    {r.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                    <p className={styles.credit}>
                      <span className={styles.work}>
                        {r.artist}, {r.artwork}
                      </span>
                      {r.credit}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.progress} aria-hidden="true">
        <span className={styles.pnow}>{pad2(active + 1)}</span>
        <span className={styles.pslash}>/</span>
        <span className={styles.ptot}>{pad2(total)}</span>
        <span className={styles.psec}>{reviews[active]?.section}</span>
      </div>

      <nav className={styles.dots} aria-label="Jump to review">
        {reviews.map((r, i) => (
          <button
            key={r.slug}
            type="button"
            className={i === active ? `${styles.dot} ${styles.dotOn}` : styles.dot}
            aria-label={`Go to review ${i + 1}: ${r.title}`}
            aria-current={i === active ? "true" : undefined}
            onClick={() => goTo(i)}
          >
            <span className={styles.dotMark} aria-hidden="true" />
          </button>
        ))}
      </nav>
    </main>
  );
}

export default View;
