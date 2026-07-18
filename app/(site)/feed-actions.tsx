"use server";

import { getReviewPage } from "@/lib/reviews-source";
import { ReviewArticle } from "@/components/site/ReviewArticle";

// Server action for the feed's "load more": fetches the next page and returns it
// as already-rendered ReviewArticle nodes (RSC), so appended reviews stay
// server-rendered — the client never imports ReviewArticle or its Portable Text
// machinery. Shape mirrors the page view-model ({items, nextOffset, hasMore}).
export async function loadMoreReviews(offset: number) {
  const page = await getReviewPage(offset);
  return {
    items: page.items.map((r) => <ReviewArticle key={r.slug} review={r} />),
    nextOffset: page.nextOffset,
    hasMore: page.hasMore,
  };
}
