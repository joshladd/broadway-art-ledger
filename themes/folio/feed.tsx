"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Review } from "@/content/reviews";
import styles from "./styles.module.css";

// The interactive part of the Folio feed lives here (scroll hooks → client).
// index.tsx stays a server module so it can export the ThemeModule object.

// Reveal-on-scroll. Content is visible by default; the hidden→shown transition
// only exists under `prefers-reduced-motion: no-preference` (see CSS).
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

// Gentle parallax drift via a `--shift` custom property; the CSS consumes it
// only when motion is allowed, so it's inert for reduced-motion users.
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
      const progress = Math.max(-1, Math.min(1, (center - vh / 2) / vh));
      const shift = progress * -22;
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

// One side-by-side moment: image column (sticky on desktop, alternating sides)
// + a text column that scrolls past it. The FIRST review (index 0) is just this
// same Moment — no cover lockup — but painted on load (no reveal hide, priority
// image) so it peeks up under the masthead and invites the scroll.
function Moment({ review, index }: { review: Review; index: number }) {
  const first = index === 0;
  const imageRight = index % 2 === 0;
  const { ref, inView } = useInView<HTMLElement>();
  const plateRef = useParallax<HTMLDivElement>();

  const className = [
    styles.moment,
    first ? "" : styles.reveal,
    first || inView ? styles.inView : "",
  ]
    .filter(Boolean)
    .join(" ");

  const gridClassName = [styles.splitGrid, imageRight ? styles.imgRight : styles.imgLeft].join(" ");

  return (
    <article ref={ref} className={className} data-side={imageRight ? "right" : "left"}>
      <div className={gridClassName}>
        <div className={styles.splitMedia}>
          <div className={styles.plate}>
            <div ref={plateRef} className={styles.plateImgWrap}>
              <Image
                className={styles.plateImg}
                src={review.image}
                alt={review.alt}
                fill
                sizes="(max-width: 880px) 100vw, 50vw"
                priority={first}
              />
            </div>
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

export function Stream({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  return (
    <div className={styles.stream}>
      {reviews.map((review, i) => (
        <Moment key={review.slug} review={review} index={i} />
      ))}
    </div>
  );
}
