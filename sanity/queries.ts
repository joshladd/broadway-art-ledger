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

// One page of the feed, newest first — Bryan: "Make sure that the most recent
// review is always at the top." The [$start...$end] slice bounds the payload so
// the feed doesn't fetch every review at once. Drafts are excluded: Sanity keeps
// them as a parallel `drafts.`-prefixed doc that would otherwise leak onto the
// live feed.
export const REVIEWS_PAGE_QUERY = defineQuery(`
  *[_type == "review" && !(_id in path("drafts.**"))] | order(publishedAt desc) [$start...$end] {
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
// The most-recent N slugs — for generateStaticParams, which prerenders only the
// recent reviews; older ones generate on demand via ISR.
export const REVIEW_SLUGS_QUERY = defineQuery(`
  *[_type == "review" && !(_id in path("drafts.**"))] | order(publishedAt desc) [0...$limit] {
    "slug": slug.current
  }
`);

// The archive's compact index row: no portable text, no full-size images. The
// body is matched inside the search query's filter (server-side), so the row
// itself carries none of it — only what the rows render. The raw hero asset URL
// is carried once and the client derives a thumbnail (shown) and the marquee URL
// (prefetched on hover) from it.
const ARCHIVE_FIELDS = `
  "slug": slug.current,
  headline,
  showName,
  tagline,
  startDate,
  endDate,
  "imageUrl": heroImage.asset->url
`;

// One page of the archive browse list, newest first — bounded so the client
// never receives the whole index at once.
export const ARCHIVE_PAGE_QUERY = defineQuery(`
  *[_type == "review" && !(_id in path("drafts.**"))] | order(publishedAt desc) [$start...$end] {
    ${ARCHIVE_FIELDS}
  }
`);

// Server-side search: match the term against headline, show name, and the body
// text, newest first. Runs in the Content Lake, so no corpus ships to the
// client. $q carries the user's term with a trailing * for prefix matching.
export const ARCHIVE_SEARCH_QUERY = defineQuery(`
  *[_type == "review" && !(_id in path("drafts.**")) && (
    headline match $q || showName match $q || pt::text(body) match $q
  )] | order(publishedAt desc) [0...$limit] {
    ${ARCHIVE_FIELDS}
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
