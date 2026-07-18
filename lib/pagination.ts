// Pagination bounding and the page-result invariant, shared by the paged read
// seams. Pure and tested, so "is there another page?" lives in one place instead
// of being re-derived (`length === PAGE_SIZE`) by every caller.

// A pagination offset clamped to a safe non-negative integer. The paged Server
// Actions are public, so a caller could pass a negative, fractional, or
// non-finite value.
export function clampOffset(offset: number): number {
  return Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : 0;
}

export type Page<T> = { items: T[]; hasMore: boolean; nextOffset: number };

// Wrap a fetched page. A full page (length === pageSize) implies there may be
// more; nextOffset advances past what came back.
export function pageResult<T>(items: T[], offset: number, pageSize: number): Page<T> {
  return {
    items,
    hasMore: items.length === pageSize,
    nextOffset: offset + items.length,
  };
}
