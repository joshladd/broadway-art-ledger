"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { loadMoreReviews } from "@/app/(site)/feed-actions";
import { usePaginatedList } from "./use-paginated-list";
import styles from "./site.module.css";

// The feed's client shell. The server renders the first page as `children`; this
// appends further pages (already-rendered ReviewArticle nodes from the server
// action) as the reader nears the bottom. The paging is usePaginatedList; the
// only feed-specific concern is the IntersectionObserver auto-load. A visible
// "Load more" button doubles as the sentinel and the no-observer fallback.
export function Feed({
  children,
  startOffset,
  hasMore: initialHasMore,
}: {
  children: ReactNode;
  startOffset: number;
  hasMore: boolean;
}) {
  const { items: appended, hasMore, loading, loadMore } = usePaginatedList<ReactNode>(
    [],
    initialHasMore,
    startOffset,
    loadMoreReviews,
  );
  const sentinel = useRef<HTMLDivElement>(null);

  // Auto-load as the sentinel nears the viewport. loadMore is stable per its
  // deps, so the observer re-binds to a fresh closure when paging state changes.
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
  }, [hasMore, loadMore]);

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
