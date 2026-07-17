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

// The copy singletons. Each has a fixed _id, so we fetch by id and take the
// published doc (never the drafts.* copy). Coalescing to the known id keeps the
// query returning at most one row.
export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0] { strap }
`);

export const ABOUT_QUERY = defineQuery(`
  *[_type == "aboutPage" && _id == "aboutPage"][0] {
    title,
    body,
    image {
      alt,
      asset->{ url, "dimensions": metadata.dimensions }
    }
  }
`);

export const SUBMIT_QUERY = defineQuery(`
  *[_type == "submitPage" && _id == "submitPage"][0] { body, formUrl, blurb }
`);
