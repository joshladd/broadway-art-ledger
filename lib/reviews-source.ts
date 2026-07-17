import { cache } from "react";
import type { Review } from "@/content/review";
import { client } from "@/sanity/client";
import { REVIEWS_QUERY } from "@/sanity/queries";
import { mapReviewRows, type ReviewRow } from "./map-review";

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

// One review by slug, or null. Backed by getReviews so it rides the same cached
// fetch — cheap at this volume, and there's no separate query to keep in sync.
export const getReview = cache(async (slug: string): Promise<Review | null> => {
  const reviews = await getReviews();
  return reviews.find((r) => r.slug === slug) ?? null;
});
