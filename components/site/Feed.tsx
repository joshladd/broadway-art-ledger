"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { loadMoreReviews } from "@/app/(site)/feed-actions";
import styles from "./site.module.css";

// The feed's client shell. The server renders the first page as `children`; this
// appends further pages (already-rendered ReviewArticle nodes from the server
// action) as the reader nears the bottom. A visible "Load more" button doubles
// as the IntersectionObserver sentinel and the no-observer fallback.
export function Feed({
  children,
  startOffset,
  hasMore: initialHasMore,
}: {
  children: ReactNode;
  startOffset: number;
  hasMore: boolean;
}) {
  const [appended, setAppended] = useState<ReactNode[]>([]);
  const [offset, setOffset] = useState(startOffset);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await loadMoreReviews(offset);
      // Each node is keyed by slug, so appending flat is safe.
      setAppended((a) => [...a, ...res.items]);
      setOffset(res.nextOffset);
      setHasMore(res.hasMore);
    } finally {
      setLoading(false);
    }
  }

  // Auto-load as the sentinel approaches the viewport. Re-created when offset or
  // loading change so it never fires with a stale closure.
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinel.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "800px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, offset, loading]);

  return (
    <div className={styles.feed}>
      {children}
      {appended}
      {hasMore && (
        <div ref={sentinel} className={styles.feedSentinel}>
          <button
            type="button"
            className={styles.loadMore}
            onClick={loadMore}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more reviews"}
          </button>
        </div>
      )}
    </div>
  );
}
