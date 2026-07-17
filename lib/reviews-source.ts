import type { Review } from "@/content/review";
import { fixtureReviews } from "@/content/reviews-fixture";

// The live site's data source, and the ONLY seam Plan 2 touches.
//
// Plan 1: the in-repo mock fixture.
// Plan 2: this body becomes a Sanity GROQ query. The signature and the Review
// contract stay identical, so no caller changes — that is the whole point of
// keeping the source behind one function.
//
// Bryan: "Make sure that the most recent review is always at the top."
export async function getReviews(): Promise<Review[]> {
  return [...fixtureReviews].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}
