import { useCallback, useState } from "react";
import type { Page } from "@/lib/pagination";

// The "load more" state machine shared by the feed and the archive browse list:
// hold the accumulated items, the offset, whether there's more, and a guarded
// async loader. Each page comes back as a Page view-model, so appending and the
// hasMore/nextOffset bookkeeping live here once. Callers layer their own
// concerns on top (the feed wraps loadMore in an IntersectionObserver; the
// archive gates it behind not-searching).
export function usePaginatedList<T>(
  initialItems: T[],
  initialHasMore: boolean,
  initialOffset: number,
  loadPage: (offset: number) => Promise<Page<T>>,
): { items: T[]; hasMore: boolean; loading: boolean; loadMore: () => void } {
  const [items, setItems] = useState<T[]>(initialItems);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const page = await loadPage(offset);
      setItems((prev) => [...prev, ...page.items]);
      setOffset(page.nextOffset);
      setHasMore(page.hasMore);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, loadPage]);

  return { items, hasMore, loading, loadMore };
}
