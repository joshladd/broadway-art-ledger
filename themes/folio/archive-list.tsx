"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Fuse, { type FuseResultMatch, type RangeTuple } from "fuse.js";
import type { Review } from "@/content/reviews";
import styles from "./styles.module.css";

/* ------------------------------------------------------------------ *
 * ArchiveList — the interactive half of Folio's Archive. Owns the
 * fuzzy search (Fuse.js), the section + sort filters, and the
 * controlled row expansion (a View-Transitions morph from the row's
 * cropped thumbnail to the full-bleed reading image). index.tsx stays
 * a server module (renders the shell) and hands us the reviews.
 * ------------------------------------------------------------------ */

// A review augmented with its body flattened to a single string, so Fuse can
// weigh the prose without us handing it an array key.
type Searchable = Review & { bodyText: string };

// field name -> the matched character ranges Fuse found for that field.
type MatchMap = Record<string, ReadonlyArray<RangeTuple>>;

type Entry = { r: Review; matches: MatchMap };

type Sort = "relevance" | "newest" | "oldest" | "section";

// Weighted keys — title dominates, body barely registers. Stable (module scope).
const FUSE_KEYS = [
  { name: "title", weight: 0.35 },
  { name: "artist", weight: 0.2 },
  { name: "venue", weight: 0.12 },
  { name: "section", weight: 0.1 },
  { name: "by", weight: 0.08 },
  { name: "hood", weight: 0.05 },
  { name: "artwork", weight: 0.05 },
  { name: "dek", weight: 0.03 },
  { name: "bodyText", weight: 0.02 },
];

const SORT_LABEL: Record<Sort, string> = {
  relevance: "Relevance",
  newest: "Newest",
  oldest: "Oldest",
  section: "Section",
};

// Render `text` with the Fuse-matched ranges wrapped in <mark>. Non-matched
// runs render as plain strings. Fuse hands back non-overlapping, but we sort
// defensively and never emit a zero-length or backwards slice.
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
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("newest");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  // debounce the search input ~120ms
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(id);
  }, [query]);

  const searching = debounced.trim().length > 0;

  // Relevance is only meaningful while searching. Default to it when a search
  // begins (Fuse score takes precedence), and fall back to Newest when cleared.
  useEffect(() => {
    setSort((prev) => {
      if (searching && prev === "newest") return "relevance";
      if (!searching && prev === "relevance") return "newest";
      return prev;
    });
  }, [searching]);

  const searchable = useMemo<Searchable[]>(
    () => reviews.map((r) => ({ ...r, bodyText: r.body.join(" ") })),
    [reviews],
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchable, {
        keys: FUSE_KEYS,
        includeMatches: true,
        includeScore: true,
        ignoreLocation: true,
        threshold: 0.38,
        minMatchCharLength: 2,
      }),
    [searchable],
  );

  // sections present in the data, in first-appearance order
  const sections = useMemo(() => {
    const seen: string[] = [];
    for (const r of reviews) if (!seen.includes(r.section)) seen.push(r.section);
    return seen;
  }, [reviews]);

  // search step: empty query -> all reviews (newest-first as delivered);
  // otherwise Fuse results ranked by score, carrying their match ranges.
  const results = useMemo<Entry[]>(() => {
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

  // filter (section) + sort. Relevance keeps Fuse order; the rest re-order.
  const list = useMemo<Entry[]>(() => {
    let out = results;
    if (activeSection) out = out.filter((e) => e.r.section === activeSection);
    const arr = [...out];
    if (sort === "newest") arr.sort((a, b) => b.r.iso.localeCompare(a.r.iso));
    else if (sort === "oldest") arr.sort((a, b) => a.r.iso.localeCompare(b.r.iso));
    else if (sort === "section")
      arr.sort(
        (a, b) =>
          a.r.section.localeCompare(b.r.section) || b.r.iso.localeCompare(a.r.iso),
      );
    // "relevance": leave Fuse's ranking untouched
    return arr;
  }, [results, activeSection, sort]);

  const sortOptions: Sort[] = searching
    ? ["relevance", "newest", "oldest", "section"]
    : ["newest", "oldest", "section"];

  function cycleSort() {
    const i = sortOptions.indexOf(sort);
    setSort(sortOptions[(i + 1) % sortOptions.length]);
  }

  // Controlled expand: one row open at a time; re-clicking the open row closes
  // it. A plain state flip — the reveal is a CSS grid-rows accordion (no view
  // transition, so it never fights the scroll position).
  function toggle(slug: string) {
    setOpenSlug((cur) => (cur === slug ? null : slug));
  }

  const total = reviews.length;
  const shown = list.length;

  return (
    <>
      {/* ---------- search + filter toolbar ---------- */}
      <div className={styles.arcTools}>
        <div className={styles.arcSearch}>
          <svg
            className={styles.arcSearchGlyph}
            viewBox="0 0 24 24"
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
            placeholder="Search reviews…"
            aria-label="Search reviews"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.arcFilters} role="group" aria-label="Filter by section">
          <span className={styles.arcFilterLabel}>Filter</span>
          <div className={styles.arcChips}>
            <button
              type="button"
              className={`${styles.arcChip} ${activeSection === null ? styles.arcChipOn : ""}`}
              aria-pressed={activeSection === null}
              onClick={() => setActiveSection(null)}
            >
              All
            </button>
            {sections.map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.arcChip} ${activeSection === s ? styles.arcChipOn : ""}`}
                aria-pressed={activeSection === s}
                onClick={() => setActiveSection((cur) => (cur === s ? null : s))}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={styles.arcSort}
            onClick={cycleSort}
            aria-label={`Sort order: ${SORT_LABEL[sort]}. Activate to change.`}
          >
            Sort: {SORT_LABEL[sort]}
          </button>
        </div>
      </div>

      {/* live result count for search/filter feedback */}
      <p className={styles.arcStatus} role="status" aria-live="polite">
        {searching || activeSection
          ? `${shown} of ${total} ${total === 1 ? "entry" : "entries"}`
          : ` `}
      </p>

      {/* ---------- ruled index list ---------- */}
      <div className={styles.arcFeed}>
        <div className={styles.arcHead} aria-hidden="true">
          <span className={styles.arcHeadPlate} />
          <span>Date</span>
          <span>Section</span>
          <span>Show &amp; venue</span>
          <span className={styles.arcHeadBy}>By</span>
        </div>

        {shown === 0 ? (
          <p className={styles.arcEmpty}>
            {searching
              ? `No entries match “${debounced.trim()}”.`
              : "No entries in the archive yet."}
          </p>
        ) : (
          <div className={styles.arcRows}>
            {list.map(({ r, matches }, i) => {
              const isOpen = openSlug === r.slug;
              const panelId = `arc-panel-${r.slug}`;
              return (
                <div
                  key={r.slug}
                  className={styles.arcRow}
                  data-open={isOpen ? "" : undefined}
                >
                  <button
                    type="button"
                    className={styles.arcSummary}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(r.slug)}
                  >
                    {/* collapsed thumbnail — cropped. Hidden entirely when the
                        row is open (the full image lives in the panel below). */}
                    <span className={styles.arcPlate}>
                      {r.image && !isOpen && (
                        <Image
                          className={styles.arcPlateImg}
                          src={r.image}
                          alt=""
                          fill
                          sizes="80px"
                          priority={i < 2}
                        />
                      )}
                    </span>

                    <span className={styles.arcDate}>
                      <span className={styles.arcDay}>{r.date}</span>
                      <span className={styles.arcNo}>{r.no}</span>
                    </span>

                    <span className={styles.arcSection}>
                      {highlight(r.section, matches.section)}
                    </span>

                    <span className={styles.arcMain}>
                      <span className={styles.arcRowTitle}>
                        {highlight(r.title, matches.title)}
                      </span>
                      <span className={styles.arcVenue}>
                        {r.artist && (
                          <>
                            {highlight(r.artist, matches.artist)}
                            {" · "}
                          </>
                        )}
                        {highlight(r.venue, matches.venue)}
                        {`, ${r.hood}`}
                      </span>
                    </span>

                    <span className={styles.arcBy}>{highlight(r.by, matches.by)}</span>

                    <span className={styles.arcCue} aria-hidden="true">
                      <span className={styles.arcCueRead}>{isOpen ? "Close" : "Read"}</span>
                      <svg className={styles.arcChevron} viewBox="0 0 24 24" focusable="false">
                        <polyline
                          points="6 9 12 15 18 9"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  {/* Accordion reveal via CSS grid-rows (0fr → 1fr) — no view
                      transition, so it never fights the scroll. Content stays in
                      the DOM but is inert while collapsed. */}
                  <div className={styles.arcPanelClip} id={panelId} inert={!isOpen}>
                    <div className={styles.arcPanelInner}>
                      <div className={styles.arcPanel}>
                        {r.image && (
                          <figure className={styles.arcFigure}>
                            {typeof r.width === "number" && typeof r.height === "number" ? (
                              <Image
                                className={styles.arcExpandImg}
                                src={r.image}
                                alt={r.alt}
                                width={r.width}
                                height={r.height}
                                sizes="(max-width: 900px) 100vw, 480px"
                                style={{ width: "100%", height: "auto" }}
                              />
                            ) : (
                              <span className={styles.arcExpandFallback}>
                                <Image
                                  className={styles.arcExpandImg}
                                  src={r.image}
                                  alt={r.alt}
                                  fill
                                  sizes="(max-width: 900px) 100vw, 480px"
                                />
                              </span>
                            )}
                            <figcaption className={styles.arcPanelCap}>
                              {r.credit || `${r.artist}${r.artwork ? `, ${r.artwork}` : ""}`}
                            </figcaption>
                          </figure>
                        )}
                        <div className={styles.arcPanelText}>
                          <p className={styles.arcDek}>{r.dek}</p>
                          <p className={styles.arcByline}>By {r.by}</p>
                          <div className={styles.arcBody}>
                            {r.body.map((para, j) => (
                              <p key={j}>{para}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
