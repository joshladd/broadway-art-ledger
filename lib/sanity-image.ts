// How a cdn.sanity.io asset gets sized — the one home for it. Previously the
// `?w=…&fit=max&auto=format` string and the `?`/`&` separator dance were
// hand-written in three places (map-review ×2, about-image), and the marquee
// prefetch reproduced next/image's request in a fourth.

// The source-variant width for the marquee/hero image. The archive derives the
// hover-prefetch target from this same width, so a prefetch is a cache hit.
export const MARQUEE_WIDTH = 1600;

// The marquee's display size. MARQUEE_SIZES (next/image `sizes`) and
// MARQUEE_DISPLAY_WIDTH describe the same 888px desktop width and live together
// so they can't drift — ReviewArticle sets `sizes` from one, the prefetch below
// derives the requested width from the other.
export const MARQUEE_SIZES = "(max-width: 820px) 100vw, 888px";
const MARQUEE_DISPLAY_WIDTH = 888;

// next/image's default device widths; the browser picks the first >= the
// display width times the viewer's pixel density.
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

// A sized cdn.sanity.io variant. fit=max never upscales; auto=format serves
// webp/avif where supported. Empty in -> empty out.
export function sanityImageUrl(assetUrl: string, width: number): string {
  if (!assetUrl) return "";
  const sep = assetUrl.includes("?") ? "&" : "?";
  return `${assetUrl}${sep}w=${width}&fit=max&auto=format`;
}

// The exact /_next/image URL the marquee will request for a viewer at `dpr`, so
// an archive-row hover prefetches the same bytes the review page then loads.
// `heroUrl` is the marquee's source variant (sanityImageUrl(url, MARQUEE_WIDTH)).
export function marqueePrefetchUrl(heroUrl: string, dpr: number): string {
  const target = Math.ceil(MARQUEE_DISPLAY_WIDTH * dpr);
  const w = DEVICE_SIZES.find((s) => s >= target) ?? DEVICE_SIZES[DEVICE_SIZES.length - 1];
  return `/_next/image?url=${encodeURIComponent(heroUrl)}&w=${w}&q=75`;
}
