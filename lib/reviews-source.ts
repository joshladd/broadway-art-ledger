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
export const FEED_PAGE_SIZE = 10;

// One page of the feed. The [start...end) slice keeps the payload bounded no
// matter how many reviews exist; the feed loads more on scroll.
export async function getReviewPage(
  offset: number,
  limit: number = FEED_PAGE_SIZE,
): Promise<Review[]> {
  const rows = await sanityFetch<ReviewRow[]>(
    REVIEWS_PAGE_QUERY,
    { start: offset, end: offset + limit },
    "reviews",
  );
  return mapReviewRows(rows);
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
export const ARCHIVE_PAGE_SIZE = 20;

// One page of the archive browse list (compact rows: plain text + thumbnails),
// so the client never receives the whole index or any portable text.
export async function getArchivePage(
  offset: number,
  limit: number = ARCHIVE_PAGE_SIZE,
): Promise<ArchiveItem[]> {
  const rows = await sanityFetch<ArchiveRow[]>(
    ARCHIVE_PAGE_QUERY,
    { start: offset, end: offset + limit },
    "reviews",
  );
  return mapArchiveRows(rows);
}

const ARCHIVE_SEARCH_LIMIT = 40;

// Server-side search — the match runs in the Content Lake, so no corpus ships to
// the client. Each term is prefix-matched. The term is passed as a parameter, so
// it can't inject into the query.
export async function searchArchive(query: string): Promise<ArchiveItem[]> {
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  const pattern = terms.map((w) => `${w}*`).join(" ");
  const rows = await sanityFetch<ArchiveRow[]>(
    ARCHIVE_SEARCH_QUERY,
    { q: pattern, limit: ARCHIVE_SEARCH_LIMIT },
    "reviews",
  );
  return mapArchiveRows(rows);
}
