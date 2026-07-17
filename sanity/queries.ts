import { defineQuery } from "next-sanity";

// Newest first — Bryan: "Make sure that the most recent review is always at the
// top." Drafts are excluded: Sanity keeps them as a parallel doc whose _id is
// prefixed `drafts.`, so without this filter unpublished edits would leak onto
// the live feed.
export const REVIEWS_QUERY = defineQuery(`
  *[_type == "review" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    "slug": slug.current,
    headline,
    showName,
    startDate,
    endDate,
    showUrl,
    tagline,
    body,
    publishedAt,
    heroImage {
      alt,
      caption,
      asset->{
        url,
        "dimensions": metadata.dimensions
      }
    }
  }
`);
