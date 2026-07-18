import { cache } from "react";
import type { Review } from "@/content/review";
import {
  REVIEWS_PAGE_QUERY,
  REVIEW_BY_SLUG_QUERY,
  REVIEW_SLUGS_QUERY,
  ARCHIVE_PAGE_QUERY,
  ARCHIVE_SEARCH_QUERY,
} from "@/sanity/queries";
import { sanityFetch } from "./sanity-fetch";
import { clampOffset, pageResult, type Page } from "./pagination";
import { parseSearchTerms, buildSearchPattern } from "./search";
import {
  mapReviewRows,
  mapReviewRow,
  isRenderable,
  mapArchiveRows,
  type ReviewRow,
  type ArchiveRow,
  type ArchiveItem,
} from "./map-review";

// The live site's data source — reviews come from Sanity. Fetching goes through
// sanityFetch (caching policy); the row -> Review mapping lives in ./map-review
// so it can be unit-tested without a dataset. Everything here is tagged
// "reviews" so /api/revalidate flushes it the moment Bryan publishes.

// How many reviews the feed shows per page (initial render and each load-more).
const FEED_PAGE_SIZE = 10;

// One page of the feed as a page view-model ({items, hasMore, nextOffset}) — the
// [start...end) slice keeps the payload bounded, and the "is there more?"
// invariant lives here, not in every caller. offset is clamped (public action).
export async function getReviewPage(
  offset: number,
  limit: number = FEED_PAGE_SIZE,
): Promise<Page<Review>> {
  const start = clampOffset(offset);
  const rows = await sanityFetch<ReviewRow[]>(
    REVIEWS_PAGE_QUERY,
    { start, end: start + limit },
    "reviews",
  );
  return pageResult(mapReviewRows(rows), start, limit);
}

// One review by slug — fetches only its own document, so a review page (and its
// ISR regeneration) never pulls the whole dataset. Returns null if missing or
// not renderable (no image/slug).
export const getReview = cache(async (slug: string): Promise<Review | null> => {
  const row = await sanityFetch<ReviewRow | null>(REVIEW_BY_SLUG_QUERY, { slug }, "reviews");
  return row && isRenderable(row) ? mapReviewRow(row) : null;
});

// How many review pages generateStaticParams prerenders at build. The rest
// generate on demand via ISR (dynamicParams), so the build stays flat no matter
// how many reviews exist.
export const PRERENDER_LIMIT = 50;

// The most-recent `limit` slugs — for generateStaticParams.
export const getReviewSlugs = cache(async (limit: number = PRERENDER_LIMIT): Promise<string[]> => {
  const rows = await sanityFetch<{ slug: string | null }[]>(
    REVIEW_SLUGS_QUERY,
    { limit },
    "reviews",
  );
  return (rows ?? []).map((r) => r.slug).filter((s): s is string => Boolean(s));
});

// How many archive rows the browse list shows per page.
const ARCHIVE_PAGE_SIZE = 20;

// One page of the archive browse list (compact rows: plain text + thumbnails) as
// a page view-model, so the client never receives the whole index.
export async function getArchivePage(
  offset: number,
  limit: number = ARCHIVE_PAGE_SIZE,
): Promise<Page<ArchiveItem>> {
  const start = clampOffset(offset);
  const rows = await sanityFetch<ArchiveRow[]>(
    ARCHIVE_PAGE_QUERY,
    { start, end: start + limit },
    "reviews",
  );
  return pageResult(mapArchiveRows(rows), start, limit);
}

const ARCHIVE_SEARCH_LIMIT = 40;

// Server-side search — the match runs in the Content Lake, so no corpus ships to
// the client. Terms are parsed/bounded and prefix-matched (see ./search); the
// pattern is passed as a parameter, so it can't inject into the query.
export async function searchArchive(query: string): Promise<ArchiveItem[]> {
  const terms = parseSearchTerms(query);
  if (terms.length === 0) return [];
  const rows = await sanityFetch<ArchiveRow[]>(
    ARCHIVE_SEARCH_QUERY,
    { q: buildSearchPattern(terms), limit: ARCHIVE_SEARCH_LIMIT },
    "reviews",
  );
  return mapArchiveRows(rows);
}
