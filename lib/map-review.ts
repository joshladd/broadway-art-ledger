import type { Review } from "@/content/review";

// The Sanity -> Review mapping, kept pure and separate from the fetch so it can
// be tested without a dataset (and so the contract is asserted, not assumed).
//
// Sanity is loosely typed at the wire: any field can come back null, and a
// half-finished document is a normal state in a CMS. The rule here is that one
// bad document must never take down the whole feed.
//
// Deliberately does NOT use @sanity/image-url: GROQ already hands back an
// absolute cdn.sanity.io asset URL, and the CDN takes sizing as query params.
// The builder would drag in sanity/env (which throws without env vars) and buy
// us only hotspot/crop handling — which this design never uses, because every
// image renders uncropped at its natural aspect.

const IMAGE_WIDTH = 1600;

function sizedImageUrl(assetUrl: string): string {
  // fit=max never upscales and preserves the true aspect ratio; auto=format
  // serves webp/avif to browsers that take them.
  const sep = assetUrl.includes("?") ? "&" : "?";
  return `${assetUrl}${sep}w=${IMAGE_WIDTH}&fit=max&auto=format`;
}

export type Dimensions = { width: number; height: number } | null;

export type ReviewRow = {
  slug: string | null;
  headline: string | null;
  showName: string | null;
  startDate: string | null;
  endDate: string | null;
  showUrl: string | null;
  tagline: string | null;
  body: unknown;
  publishedAt: string | null;
  heroImage: {
    alt: string | null;
    caption: string | null;
    asset: { url: string | null; dimensions: Dimensions } | null;
  } | null;
};

const s = (v: unknown): string => (typeof v === "string" ? v : "");

// A review with no image can't render the marquee the design is built around,
// and one with no slug has no stable React key. Skip those rather than crash.
export function isRenderable(row: ReviewRow): boolean {
  return Boolean(row?.slug && row?.heroImage?.asset?.url);
}

export function mapReviewRow(row: ReviewRow): Review {
  const dim = row.heroImage?.asset?.dimensions ?? null;
  return {
    slug: s(row.slug),
    headline: s(row.headline),
    showName: s(row.showName),
    startDate: s(row.startDate),
    endDate: s(row.endDate),
    showUrl: s(row.showUrl),
    tagline: s(row.tagline),
    publishedAt: s(row.publishedAt),
    body: (Array.isArray(row.body) ? row.body : []) as Review["body"],
    image: {
      // Serve a sized image off Sanity's CDN rather than the full original.
      url: sizedImageUrl(s(row.heroImage?.asset?.url)),
      // Sanity's asset metadata carries the true pixel size. Falling back to a
      // 4:3 guess would distort layout, so only use it if metadata is absent.
      width: dim?.width ?? 1200,
      height: dim?.height ?? 900,
      // alt is a11y-only and never shown; the headline is a reasonable last
      // resort so screen readers get something meaningful.
      alt: s(row.heroImage?.alt) || s(row.headline),
      caption: s(row.heroImage?.caption),
    },
  };
}

export function mapReviewRows(rows: ReviewRow[] | null): Review[] {
  return (rows ?? []).filter(isRenderable).map(mapReviewRow);
}
