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

// Meta line: venue · hood · date. The section is dropped here — it already
// lives in the `№ · section` plate directly above this line.
function Meta({ review }: { review: Review }) {
  return (
    <p className={styles.metaLine}>
      <span className={styles.metaSection}>{review.venue}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span>{review.hood}</span>
      <span className={styles.dot} aria-hidden="true">·</span>
      <span className={styles.metaDate}>{review.date}</span>
    </p>
  );
}

// The marquee image, rendered at its TRUE aspect ratio, uncropped. When the
// real pixel dims are known we hand next/image intrinsic width/height and let
// it size fluidly (width:100% / height:auto). Without dims we fall back to a
// 4/3 box with `contain` — still the whole artwork, no crop.
function Plate({ review, priority }: { review: Review; priority: boolean }) {
  const { width, height } = review;
  if (typeof width === "number" && typeof height === "number") {
    return (
      <div className={styles.plate}>
        <Image
          className={styles.plateImg}
          src={review.image}
          alt={review.alt}
          width={width}
          height={height}
          sizes="(max-width: 880px) 100vw, 50vw"
          style={{ width: "100%", height: "auto" }}
          priority={priority}
        />
      </div>
    );
  }
  return (
    <div className={styles.plate}>
      <div className={styles.plateBox}>
        <Image
          className={styles.plateImg}
          src={review.image}
          alt={review.alt}
          fill
          sizes="(max-width: 880px) 100vw, 50vw"
          priority={priority}
        />
      </div>
    </div>
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
          <Plate review={review} priority={first} />
          {review.credit && <p className={styles.mediaCredit}>{review.credit}</p>}
        </div>
        <div className={styles.splitText}>
          <p className={styles.sectionTag}>
            <span className={styles.no}>{review.no}</span>
            <span className={styles.dot} aria-hidden="true">·</span>
            <span>{review.section}</span>
          </p>
          <Meta review={review} />
          <h2 className={styles.mTitle}>{review.title}</h2>
          <p className={styles.mDek}>{review.dek}</p>
          <div className={styles.reading}>
            <p className={styles.byline}>By {review.by}</p>
            <div className={styles.prose}>
              {review.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// Floating "back to top" control — appears once the reader is past ~1 viewport,
// pinned bottom-right (clear of the bottom-center theme switcher). Scroll
// position is read on a rAF-throttled scroll listener; the click honors
// prefers-reduced-motion (jump vs. smooth).
function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const update = () => {
      raf = 0;
      setShown(window.scrollY > window.innerHeight);
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

  function toTop() {
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      className={`${styles.toTop} ${shown ? styles.toTopShown : ""}`}
      onClick={toTop}
      aria-label="Back to top"
      aria-hidden={shown ? undefined : true}
      tabIndex={shown ? 0 : -1}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <polyline
          points="6 14 12 8 18 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function Stream({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  return (
    <>
      <div className={styles.stream}>
        {reviews.map((review, i) => (
          <Moment key={review.slug} review={review} index={i} />
        ))}
      </div>
      <BackToTop />
    </>
  );
}
