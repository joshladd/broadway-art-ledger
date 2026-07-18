// The About image, sized off Sanity's CDN. Pure (no Sanity client), so it can
// be unit-tested; kept out of site-content.ts, which imports the client.
//
// Returns null when no image is set — the About page then renders nothing
// rather than a broken <img>.
import { sanityImageUrl } from "./sanity-image";

export type AboutImage = { url: string; width: number; height: number; alt: string };

export const ABOUT_IMAGE_WIDTH = 900;

export function aboutImage(raw: unknown): AboutImage | null {
  const img = raw as {
    alt?: unknown;
    asset?: { url?: unknown; dimensions?: { width?: number; height?: number } | null } | null;
  } | null;
  const url = img?.asset?.url;
  if (typeof url !== "string" || !url) return null;
  return {
    url: sanityImageUrl(url, ABOUT_IMAGE_WIDTH),
    width: img.asset?.dimensions?.width ?? ABOUT_IMAGE_WIDTH,
    height: img.asset?.dimensions?.height ?? Math.round((ABOUT_IMAGE_WIDTH * 2) / 3),
    alt: typeof img.alt === "string" ? img.alt : "",
  };
}
