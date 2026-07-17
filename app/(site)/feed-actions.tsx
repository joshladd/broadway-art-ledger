"use server";

import { getReviewPage, FEED_PAGE_SIZE } from "@/lib/reviews-source";
import { ReviewArticle } from "@/components/site/ReviewArticle";

// Server action for the feed's "load more": fetches the next page and returns it
// as already-rendered ReviewArticle nodes (RSC), so appended reviews stay
// server-rendered — the client never imports ReviewArticle or its Portable Text
// machinery. `nextOffset` and `hasMore` drive the client's paging.
export async function loadMoreReviews(offset: number) {
  const reviews = await getReviewPage(offset, FEED_PAGE_SIZE);
  return {
    nodes: reviews.map((r) => <ReviewArticle key={r.slug} review={r} />),
    nextOffset: offset + reviews.length,
    hasMore: reviews.length === FEED_PAGE_SIZE,
  };
}
