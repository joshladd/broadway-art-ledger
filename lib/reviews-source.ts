import type { Review } from "@/content/review";
import { client } from "@/sanity/client";
import { REVIEWS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";

// The live site's data source — reviews come from Sanity.
//
// This is the only file that changed when the source moved off the mock
// fixture: the Review contract is identical, so no page or component needed
// touching. That was the point of keeping the source behind one function.
//
// Tagged "reviews" so /api/revalidate can flush it the moment Bryan publishes;
// the revalidate window is the fallback if the webhook ever misses.
const REVALIDATE = 60;

type Dimensions = { width: number; height: number } | null;

type Row = {
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

export async function getReviews(): Promise<Review[]> {
  const rows = await client.fetch<Row[]>(
    REVIEWS_QUERY,
    {},
    { next: { revalidate: REVALIDATE, tags: ["reviews"] } },
  );

  return (rows ?? [])
    // A review with no image can't render the marquee the design is built
    // around, so skip it rather than crash the whole feed.
    .filter((r) => r.slug && r.heroImage?.asset?.url)
    .map((r) => {
      const dim = r.heroImage?.asset?.dimensions ?? null;
      return {
        slug: s(r.slug),
        headline: s(r.headline),
        showName: s(r.showName),
        startDate: s(r.startDate),
        endDate: s(r.endDate),
        showUrl: s(r.showUrl),
        tagline: s(r.tagline),
        publishedAt: s(r.publishedAt),
        body: (Array.isArray(r.body) ? r.body : []) as Review["body"],
        image: {
          // Serve a sized image off Sanity's CDN rather than the full original.
          // fit("max") preserves the true aspect ratio, which the design needs.
          url: urlFor(r.heroImage as never).width(1600).fit("max").auto("format").url(),
          width: dim?.width ?? 1200,
          height: dim?.height ?? 900,
          alt: s(r.heroImage?.alt) || s(r.headline),
          caption: s(r.heroImage?.caption),
        },
      };
    });
}
