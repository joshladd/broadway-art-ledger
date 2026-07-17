"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Fuse, { type FuseResultMatch, type RangeTuple } from "fuse.js";
import type { PortableTextBlock } from "@portabletext/types";
import type { Review } from "@/content/review";
import { formatRange } from "@/lib/format-date";
import styles from "./site.module.css";

/* The interactive half of the Archive. Its job is to find a review without the
 * raw scroll, so search is its reason to exist. Rows link to each review's own
 * page (/reviews/<slug>) — a writer can share that link. The route stays a
 * server component and hands us the reviews. */

type MatchMap = Record<string, ReadonlyArray<RangeTuple>>;
type Entry = { r: Review; matches: MatchMap };
type Searchable = Review & { bodyText: string };

// Keys map to the live model. headline dominates; body barely registers.
const FUSE_KEYS = [
  { name: "headline", weight: 0.5 },
  { name: "showName", weight: 0.28 },
  { name: "tagline", weight: 0.12 },
  { name: "bodyText", weight: 0.1 },
];

// Flatten Portable Text to plain text so Fuse can weigh the prose without
// being handed a nested structure.
function toPlainText(blocks: PortableTextBlock[]): string {
  return (blocks ?? [])
    .map((b) => {
      const block = b as unknown as {
        _type?: string;
        children?: Array<{ text?: string }>;
      };
      if (block._type !== "block" || !Array.isArray(block.children)) return "";
      return block.children.map((c) => c.text ?? "").join("");
    })
    .join(" ")
    .trim();
}

// Render `text` with Fuse's matched ranges wrapped in <mark>. Fuse hands back
// non-overlapping ranges, but sort defensively and never emit a zero-length or
// backwards slice.
function highlight(text: string, ranges?: ReadonlyArray<RangeTuple>): React.ReactNode {
  if (!ranges || ranges.length === 0) return text;
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const out: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach(([start, end], i) => {
    const s = Math.max(start, cursor);
    const e = end + 1; // Fuse ranges are inclusive
    if (e <= s) return;
    if (s > cursor) out.push(text.slice(cursor, s));
    out.push(
      <mark key={i} className={styles.hl}>
        {text.slice(s, e)}
      </mark>,
    );
    cursor = e;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export default function ArchiveList({ reviews }: { reviews: Review[] }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(id);
  }, [query]);

  const searching = debounced.trim().length > 0;

  const searchable = useMemo<Searchable[]>(
    () => reviews.map((r) => ({ ...r, bodyText: toPlainText(r.body) })),
    [reviews],
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchable, {
        keys: FUSE_KEYS,
        includeMatches: true,
        ignoreLocation: true,
        threshold: 0.38,
        minMatchCharLength: 2,
      }),
    [searchable],
  );

  // Empty query -> every review, newest-first as delivered. Otherwise Fuse
  // results ranked by relevance, carrying their match ranges.
  const list = useMemo<Entry[]>(() => {
    const q = debounced.trim();
    if (!q) return reviews.map((r) => ({ r, matches: {} }));
    return fuse.search(q).map((res) => {
      const matches: MatchMap = {};
      for (const m of (res.matches ?? []) as ReadonlyArray<FuseResultMatch>) {
        if (m.key && !(m.key in matches)) matches[m.key] = m.indices;
      }
      return { r: res.item as Review, matches };
    });
  }, [debounced, fuse, reviews]);

  if (reviews.length === 0) {
    return <p className={styles.arcEmpty}>No reviews yet.</p>;
  }

  return (
    <>
      <div className={styles.arcSearch} role="search">
        <svg
          className={styles.arcSearchGlyph}
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <line
            x1="16.5"
            y1="16.5"
            x2="21"
            y2="21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          className={styles.arcSearchInput}
          type="search"
          placeholder="Search reviews"
          aria-label="Search reviews"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <p className={styles.arcStatus} role="status" aria-live="polite">
        {searching ? `${list.length} of ${reviews.length}` : " "}
      </p>

      {list.length === 0 ? (
        <p className={styles.arcEmpty}>No reviews match that search.</p>
      ) : (
        <div className={styles.arcRows}>
          {list.map(({ r, matches }) => {
            const range = formatRange(r.startDate, r.endDate);
            return (
              <div key={r.slug} className={styles.arcRow}>
                <Link href={`/reviews/${r.slug}`} className={styles.arcSummary}>
                  <span className={styles.arcPlate}>
                    {r.image.url && (
                      <Image
                        className={styles.arcPlateImg}
                        src={r.image.url}
                        alt=""
                        fill
                        sizes="64px"
                      />
                    )}
                  </span>

                  <span>
                    <span className={styles.arcRowTitle}>
                      {highlight(r.headline, matches.headline)}
                    </span>
                    <span className={styles.arcRowMeta}>
                      {highlight(r.showName, matches.showName)}
                      {range ? `, ${range}` : ""}
                    </span>
                  </span>

                  <span className={styles.arcCue} aria-hidden="true">
                    Read
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
