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

// The archive's lightweight search item: plain body text (flattened in GROQ),
// a small thumbnail (shown), and the full-size marquee URL — the same URL the
// review page loads — so hovering a row can prefetch it. Never portable text.
export type ArchiveItem = {
  slug: string;
  headline: string;
  showName: string;
  tagline: string;
  startDate: string;
  endDate: string;
  bodyText: string;
  thumbUrl: string;
  heroUrl: string;
};

export type ArchiveRow = {
  slug: string | null;
  headline: string | null;
  showName: string | null;
  tagline: string | null;
  startDate: string | null;
  endDate: string | null;
  bodyText: string | null;
  imageUrl: string | null;
};

const ARCHIVE_THUMB_WIDTH = 160; // ~2x the 64px display slot, for retina

function sizedThumbUrl(assetUrl: string): string {
  if (!assetUrl) return "";
  const sep = assetUrl.includes("?") ? "&" : "?";
  return `${assetUrl}${sep}w=${ARCHIVE_THUMB_WIDTH}&fit=max&auto=format`;
}

export function mapArchiveRows(rows: ArchiveRow[] | null): ArchiveItem[] {
  return (rows ?? [])
    .filter((r) => Boolean(r?.slug))
    .map((r) => {
      const raw = s(r.imageUrl);
      return {
        slug: s(r.slug),
        headline: s(r.headline),
        showName: s(r.showName),
        tagline: s(r.tagline),
        startDate: s(r.startDate),
        endDate: s(r.endDate),
        bodyText: s(r.bodyText),
        thumbUrl: sizedThumbUrl(raw),
        // Same sizing the review page uses (sizedImageUrl), so a hover prefetch
        // targets the exact asset the marquee will request.
        heroUrl: raw ? sizedImageUrl(raw) : "",
      };
    });
}
