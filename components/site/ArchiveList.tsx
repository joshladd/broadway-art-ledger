"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ArchiveItem } from "@/lib/map-review";
import { formatRange } from "@/lib/format-date";
import { marqueePrefetchUrl } from "@/lib/sanity-image";
import { parseSearchTerms, splitOnTerms } from "@/lib/search";
import { loadMoreArchive, runArchiveSearch } from "@/app/(site)/archive-actions";
import { usePaginatedList } from "./use-paginated-list";
import styles from "./site.module.css";

/* The interactive half of the Archive. Search runs server-side (the Content Lake
 * matches the term — no corpus ships to the client); the no-query browse list is
 * paginated. Rows link to each review's own page. The server hands us the first
 * browse page. */

// Wrap each occurrence of a search term in <mark>. splitOnTerms (shared with the
// server search) escapes the terms, so a query like "c++" can't break the regex.
function highlight(text: string, terms: string[]): React.ReactNode {
  return splitOnTerms(text, terms).map((seg, i) =>
    seg.match ? (
      <mark key={i} className={styles.hl}>
        {seg.value}
      </mark>
    ) : (
      seg.value
    ),
  );
}

export default function ArchiveList({
  initialItems,
  initialHasMore,
  initialOffset,
}: {
  initialItems: ArchiveItem[];
  initialHasMore: boolean;
  initialOffset: number;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  // Browse list (no query): paginated via the shared hook.
  const {
    items: browse,
    hasMore,
    loading: loadingMore,
    loadMore,
  } = usePaginatedList<ArchiveItem>(initialItems, initialHasMore, initialOffset, loadMoreArchive);

  // Search results (a query is active).
  const [results, setResults] = useState<ArchiveItem[] | null>(null);
  const [searching, setSearching] = useState(false);

  const prefetched = useRef<Set<string>>(new Set());

  // Same term parsing the server search uses, so highlights match what was found.
  const terms = parseSearchTerms(debounced);
  const isSearching = terms.length > 0;
  const items = isSearching ? results ?? [] : browse;

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  // Data-fetching effect: run the server-side search when the debounced query
  // changes, and clear back to browse when it's emptied. This is a legitimate
  // effect (synchronizing with an external system — the search API); the eager
  // setSearching drives the loading label. `active` guards out-of-order results.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const q = debounced.trim();
    if (!q) {
      setResults(null);
      setSearching(false);
      return;
    }
    let active = true;
    setSearching(true);
    runArchiveSearch(q).then((r) => {
      if (active) {
        setResults(r);
        setSearching(false);
      }
    });
    return () => {
      active = false;
    };
  }, [debounced]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function prefetchHero(item: ArchiveItem) {
    if (!item.heroUrl || prefetched.current.has(item.slug)) return;
    prefetched.current.add(item.slug);
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "image";
    link.href = marqueePrefetchUrl(item.heroUrl, window.devicePixelRatio || 1);
    document.head.appendChild(link);
  }

  const status = searching
    ? "Searching…"
    : isSearching
      ? `${items.length} result${items.length === 1 ? "" : "s"}`
      : " ";

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
        {status}
      </p>

      {isSearching && !searching && items.length === 0 ? (
        <p className={styles.arcEmpty}>No reviews match that search.</p>
      ) : items.length === 0 && !isSearching ? (
        <p className={styles.arcEmpty}>No reviews yet.</p>
      ) : (
        <div className={styles.arcRows}>
          {items.map((r) => {
            const range = formatRange(r.startDate, r.endDate);
            return (
              <div key={r.slug} className={styles.arcRow}>
                <Link
                  href={`/reviews/${r.slug}`}
                  className={styles.arcSummary}
                  onMouseEnter={() => prefetchHero(r)}
                  onFocus={() => prefetchHero(r)}
                >
                  <span className={styles.arcPlate}>
                    {r.thumbUrl && (
                      <Image
                        className={styles.arcPlateImg}
                        src={r.thumbUrl}
                        alt=""
                        fill
                        sizes="64px"
                      />
                    )}
                  </span>

                  <span>
                    <span className={styles.arcRowTitle}>{highlight(r.headline, terms)}</span>
                    <span className={styles.arcRowMeta}>
                      {highlight(r.showName, terms)}
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

      {!isSearching && hasMore && (
        <div className={styles.feedSentinel}>
          <button
            type="button"
            className={styles.loadMore}
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
