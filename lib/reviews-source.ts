import { cache } from "react";
import type { Review } from "@/content/review";
import {
  REVIEWS_QUERY,
  REVIEW_BY_SLUG_QUERY,
  REVIEW_SLUGS_QUERY,
  ARCHIVE_QUERY,
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

// React-cached so the feed, the archive, and a solo page's generateMetadata +
// render all share one fetch within a request.
export const getReviews = cache(async (): Promise<Review[]> => {
  const rows = await sanityFetch<ReviewRow[]>(REVIEWS_QUERY, {}, "reviews");
  return mapReviewRows(rows);
});

// One review by slug — fetches only its own document, so a review page (and its
// ISR regeneration) never pulls the whole dataset. Returns null if missing or
// not renderable (no image/slug).
export const getReview = cache(async (slug: string): Promise<Review | null> => {
  const row = await sanityFetch<ReviewRow | null>(REVIEW_BY_SLUG_QUERY, { slug }, "reviews");
  return row && isRenderable(row) ? mapReviewRow(row) : null;
});

// Slugs only — for generateStaticParams. Tiny payload vs. the full dataset.
export const getReviewSlugs = cache(async (): Promise<string[]> => {
  const rows = await sanityFetch<{ slug: string | null }[]>(REVIEW_SLUGS_QUERY, {}, "reviews");
  return (rows ?? []).map((r) => r.slug).filter((s): s is string => Boolean(s));
});

// The archive's compact search index (plain body text + thumbnails), so the
// client never receives portable text or full-size images.
export const getArchiveItems = cache(async (): Promise<ArchiveItem[]> => {
  const rows = await sanityFetch<ArchiveRow[]>(ARCHIVE_QUERY, {}, "reviews");
  return mapArchiveRows(rows);
});
