"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Review } from "@/content/reviews";
import styles from "./archive.module.css";

type Preview = { slug: string; x: number; y: number } | null;

// Box the floating hover-preview occupies (px). Kept in sync with the CSS on
// `.preview`; used only to clamp the reveal inside the viewport.
const PV_W = 200;
const PV_H = 178;
const PV_GAP = 22;
const PV_PAD = 14;

// `no` arrives pre-formatted ("№ 008") from getReviews(); pull the digits when
// we need a number for the masthead range.
function digits(no: string): number {
  const n = parseInt(no.replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? NaN : n;
}

export default function Archive({
  reviews,
  backHref,
  backLabel,
}: {
  reviews: Review[];
  backHref: string;
  backLabel: string;
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview>(null);
  // Only devices that truly hover (fine pointer) get the floating reveal.
  const canHover = useRef(false);

  useEffect(() => {
    canHover.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  const toggle = useCallback((slug: string) => {
    setOpenSlug((cur) => (cur === slug ? null : slug));
    setPreview(null);
  }, []);

  const onRowMove = useCallback(
    (r: Review) => (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!canHover.current || openSlug === r.slug || !r.image) {
        if (preview) setPreview(null);
        return;
      }
      setPreview({ slug: r.slug, x: e.clientX, y: e.clientY });
    },
    [openSlug, preview]
  );

  const onRowLeave = useCallback(
    (r: Review) => () => {
      setPreview((p) => (p && p.slug === r.slug ? null : p));
    },
    []
  );

  // № range for the masthead count line.
  const nums = reviews.map((r) => digits(r.no)).filter((n) => !Number.isNaN(n));
  const lo = nums.length ? Math.min(...nums) : 0;
  const hi = nums.length ? Math.max(...nums) : 0;
  const pad3 = (n: number) => String(n).padStart(3, "0");

  // Hover reveal — the one place inline style is sanctioned (cursor-computed).
  const pv = preview ? reviews.find((r) => r.slug === preview.slug) : null;
  let pvStyle: React.CSSProperties | undefined;
  if (preview && typeof window !== "undefined") {
    let left = preview.x + PV_GAP;
    if (left + PV_W + PV_PAD > window.innerWidth) left = preview.x - PV_W - PV_GAP;
    left = Math.max(PV_PAD, left);
    let top = preview.y - PV_H / 2;
    top = Math.max(PV_PAD, Math.min(top, window.innerHeight - PV_H - PV_PAD));
    pvStyle = { left, top };
  }

  return (
    <main className={styles.page}>
      <p className={styles.backTop}>
        <Link href={backHref} className={styles.back}>
          {backLabel}
        </Link>
      </p>

      <header className={styles.masthead}>
        <p className={styles.kicker}>The Broadway Art Ledger</p>
        <h1 className={styles.title}>Archive</h1>
        <p className={styles.lede}>Every review in the collection — newest first.</p>
        {reviews.length > 0 && (
          <p className={styles.count}>
            №&nbsp;{pad3(hi)}–{pad3(lo)} <span className={styles.dot}>·</span> {reviews.length}{" "}
            {reviews.length === 1 ? "entry" : "entries"}
          </p>
        )}
      </header>

      <div className={styles.tableHead} aria-hidden="true">
        <span className={styles.hNo}>No.</span>
        <span className={styles.hTitle}>Title</span>
        <span className={styles.hVenue}>Venue</span>
        <span className={styles.hSection}>Section</span>
        <span className={styles.hDate}>Date</span>
        <span className={styles.hMark} />
      </div>

      {reviews.length === 0 ? (
        <p className={styles.empty}>The archive is quiet just now. Reviews will appear here.</p>
      ) : (
        <ol className={styles.list}>
          {reviews.map((r) => {
            const open = openSlug === r.slug;
            const panelId = `arc-panel-${r.slug}`;
            const btnId = `arc-row-${r.slug}`;
            return (
              <li key={r.slug} className={`${styles.item} ${open ? styles.itemOpen : ""}`}>
                <h2 className={styles.rowH}>
                  <button
                    id={btnId}
                    type="button"
                    className={styles.rowBtn}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(r.slug)}
                    onMouseMove={onRowMove(r)}
                    onMouseLeave={onRowLeave(r)}
                  >
                    <span className={styles.cNo}>{r.no}</span>
                    <span className={styles.cTitle}>
                      <span className={styles.tTitle}>{r.title}</span>
                      <span className={styles.tArtist}>{r.artist}</span>
                    </span>
                    <span className={styles.cMeta}>
                      <span className={styles.cVenue}>
                        <span className={styles.vName}>{r.venue}</span>
                        <span className={styles.vHood}>{r.hood}</span>
                      </span>
                      <span className={styles.cSection}>{r.section}</span>
                      <span className={styles.cDate}>{r.date}</span>
                    </span>
                    <span className={styles.cMark} aria-hidden="true">
                      <span className={styles.markGlyph}>+</span>
                    </span>
                  </button>
                </h2>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className={styles.panel}
                  inert={!open}
                >
                  <div className={styles.panelClip}>
                    <div className={styles.panelInner}>
                      <p className={styles.dek}>{r.dek}</p>
                      <p className={styles.byline}>
                        <span className={styles.byName}>By {r.by}</span>
                        <span className={styles.bySep}>·</span>
                        <span>{r.section}</span>
                        <span className={styles.bySep}>·</span>
                        <span>{r.date}</span>
                      </p>
                      {r.image && (
                        <figure className={styles.figure}>
                          <div className={styles.frame}>
                            <img src={r.image} alt={r.alt} loading="lazy" className={styles.img} />
                          </div>
                          <figcaption className={styles.cap}>
                            {r.artist}, <i>{r.artwork}</i>
                          </figcaption>
                        </figure>
                      )}
                      <div className={styles.body}>
                        {r.body.map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                      <p className={styles.credit}>{r.credit}</p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <p className={styles.backBottom}>
        <Link href={backHref} className={styles.back}>
          {backLabel}
        </Link>
      </p>

      {pv && pv.image && (
        <div className={styles.preview} style={pvStyle} aria-hidden="true">
          <img src={pv.image} alt="" className={styles.previewImg} />
          <span className={styles.previewTag}>{pv.no}</span>
        </div>
      )}
    </main>
  );
}
