import type { PortableTextBlock } from "@portabletext/types";

// The live content contract: what Sanity produces and the finalized site renders.
//
// DISTINCT from the legacy `Review` in content/reviews.ts, which is frozen and
// belongs to the /designs exploration. Do not merge them — 38 exploration files
// depend on the legacy shape (see the spec's "Why the freeze").

export type ReviewImage = {
  url: string;
  width: number;   // true pixel width, for natural aspect
  height: number;  // true pixel height
  alt: string;     // accessibility only, never rendered as visible copy
  caption: string; // writer-provided; renders aligned to the image
};

export type Review = {
  slug: string;        // identity key only — NOT a URL. There are no review pages.
  headline: string;    // the review's own editorial title
  showName: string;    // free-text dateline label (gallery, institution, or show)
  startDate: string;   // ISO YYYY-MM-DD
  endDate: string;     // ISO YYYY-MM-DD
  showUrl: string;     // dateline link target; empty -> dateline renders unlinked
  body: PortableTextBlock[];
  image: ReviewImage;
  tagline?: string;    // renders IFF non-empty (Bryan's per-review opt-in)
  publishedAt: string; // ISO datetime; ordering key, newest first
};
