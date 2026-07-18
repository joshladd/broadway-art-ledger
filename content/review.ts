import type { PortableTextBlock } from "@portabletext/types";

// The content contract: what Sanity produces and the site renders. This is the
// source of truth for a review's shape — Sanity's schema conforms to it, not the
// other way around. Change this type deliberately when the model changes.

export type ReviewImage = {
  url: string;
  width: number;   // true pixel width, for natural aspect
  height: number;  // true pixel height
  alt: string;     // accessibility only, never rendered as visible copy
  caption: string; // writer-provided; renders aligned to the image
};

export type Review = {
  slug: string;        // identity key AND the review's URL: /reviews/<slug>
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
