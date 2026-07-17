import { defineQuery } from "next-sanity";

// The full review projection, reused by the feed query and the single-review
// query so they can't drift.
const REVIEW_FIELDS = `
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
`;

// Newest first — Bryan: "Make sure that the most recent review is always at the
// top." Drafts are excluded: Sanity keeps them as a parallel doc whose _id is
// prefixed `drafts.`, so without this filter unpublished edits would leak onto
// the live feed. Used by the home feed only.
export const REVIEWS_QUERY = defineQuery(`
  *[_type == "review" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    ${REVIEW_FIELDS}
  }
`);

// One review by slug — so a review page fetches only its own document instead
// of the whole dataset.
export const REVIEW_BY_SLUG_QUERY = defineQuery(`
  *[_type == "review" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    ${REVIEW_FIELDS}
  }
`);

// Slugs only — for generateStaticParams, which needs nothing else.
export const REVIEW_SLUGS_QUERY = defineQuery(`
  *[_type == "review" && !(_id in path("drafts.**"))]{ "slug": slug.current }
`);

// The archive's search index: no portable text, no full-size images. pt::text()
// flattens the body to a plain string server-side. The raw hero asset URL is
// carried once and the client derives both a thumbnail (shown) and the
// full-size marquee URL (prefetched on hover) from it.
export const ARCHIVE_QUERY = defineQuery(`
  *[_type == "review" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    "slug": slug.current,
    headline,
    showName,
    tagline,
    startDate,
    endDate,
    "bodyText": pt::text(body),
    "imageUrl": heroImage.asset->url
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
