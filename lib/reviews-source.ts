import { cache } from "react";
import type { Review } from "@/content/review";
import { client } from "@/sanity/client";
import {
  REVIEWS_QUERY,
  REVIEW_BY_SLUG_QUERY,
  REVIEW_SLUGS_QUERY,
  ARCHIVE_QUERY,
} from "@/sanity/queries";
import {
  mapReviewRows,
  mapReviewRow,
  isRenderable,
  mapArchiveRows,
  type ReviewRow,
  type ArchiveRow,
  type ArchiveItem,
} from "./map-review";

// The live site's data source — reviews come from Sanity.
//
// This is the only file that changed when the source moved off the mock
// fixture: the Review contract is identical, so no page or component needed
// touching. That was the point of keeping the source behind one function.
//
// The row -> Review mapping lives in ./map-review so it can be unit-tested
// without a dataset.
//
// Tagged "reviews" so /api/revalidate can flush it the moment Bryan publishes;
// the revalidate window is only the fallback if the webhook ever misses.
const REVALIDATE = 60;

// React-cached so the feed, the archive, and a solo page's generateMetadata +
// render all share one fetch within a request. The named tag still lets
// /api/revalidate flush it on publish.
export const getReviews = cache(async (): Promise<Review[]> => {
  const rows = await client.fetch<ReviewRow[]>(
    REVIEWS_QUERY,
    {},
    { next: { revalidate: REVALIDATE, tags: ["reviews"] } },
  );
  return mapReviewRows(rows);
});

// One review by slug — fetches only its own document, so a review page (and its
// ISR regeneration) never pulls the whole dataset. Returns null if missing or
// not renderable (no image/slug).
export const getReview = cache(async (slug: string): Promise<Review | null> => {
  const row = await client.fetch<ReviewRow | null>(
    REVIEW_BY_SLUG_QUERY,
    { slug },
    { next: { revalidate: REVALIDATE, tags: ["reviews"] } },
  );
  return row && isRenderable(row) ? mapReviewRow(row) : null;
});

// Slugs only — for generateStaticParams. Tiny payload vs. the full dataset.
export const getReviewSlugs = cache(async (): Promise<string[]> => {
  const rows = await client.fetch<{ slug: string | null }[]>(
    REVIEW_SLUGS_QUERY,
    {},
    { next: { revalidate: REVALIDATE, tags: ["reviews"] } },
  );
  return (rows ?? []).map((r) => r.slug).filter((s): s is string => Boolean(s));
});

// The archive's compact search index (plain body text + thumbnails), so the
// client never receives portable text or full-size images.
export const getArchiveItems = cache(async (): Promise<ArchiveItem[]> => {
  const rows = await client.fetch<ArchiveRow[]>(
    ARCHIVE_QUERY,
    {},
    { next: { revalidate: REVALIDATE, tags: ["reviews"] } },
  );
  return mapArchiveRows(rows);
});
