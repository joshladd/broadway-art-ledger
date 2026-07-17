import { cache } from "react";
import type { PortableTextBlock } from "@portabletext/types";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY, ABOUT_QUERY, SUBMIT_QUERY } from "@/sanity/queries";
import {
  strap as DEFAULT_STRAP,
  aboutStatement,
  SUBMIT_FORM_URL,
} from "@/content/site";
import {
  aboutBodyBlocks,
  submitBodyBlocks,
  submitBlurbBlocks,
} from "./copy-blocks";

// The site's editable copy comes from Sanity singletons, with content/site.ts
// as the committed fallback. Every field falls back independently, so a
// singleton that exists but is missing one field still renders — nothing can
// come out blank. Before Bryan seeds/edits anything, the site looks exactly as
// it does today, because the fallback IS today's copy.
//
// Tagged "copy" so /api/revalidate can flush it on publish, same as reviews.

const REVALIDATE = 60;

const str = (v: unknown, fallback: string): string =>
  typeof v === "string" && v.trim() ? v : fallback;

const blocks = (v: unknown, fallback: PortableTextBlock[]): PortableTextBlock[] =>
  Array.isArray(v) && v.length ? (v as PortableTextBlock[]) : fallback;

// The About image, sized off Sanity's CDN. null -> the page uses its built-in
// image (public/about.png) until Bryan uploads a hi-res one.
export type AboutImage = { url: string; width: number; height: number; alt: string };
export type AboutContent = {
  title: string;
  body: PortableTextBlock[];
  image: AboutImage | null;
};
export type SubmitContent = {
  body: PortableTextBlock[];
  formUrl: string;
  blurb: PortableTextBlock[];
};

const ABOUT_IMAGE_WIDTH = 900;

function aboutImage(raw: unknown): AboutImage | null {
  const img = raw as {
    alt?: unknown;
    asset?: { url?: unknown; dimensions?: { width?: number; height?: number } | null } | null;
  } | null;
  const url = img?.asset?.url;
  if (typeof url !== "string" || !url) return null;
  const sep = url.includes("?") ? "&" : "?";
  return {
    url: `${url}${sep}w=${ABOUT_IMAGE_WIDTH}&fit=max&auto=format`,
    width: img.asset?.dimensions?.width ?? ABOUT_IMAGE_WIDTH,
    height: img.asset?.dimensions?.height ?? Math.round((ABOUT_IMAGE_WIDTH * 2) / 3),
    alt: typeof img.alt === "string" ? img.alt : "",
  };
}

export const getStrap = cache(async (): Promise<string> => {
  const row = await client.fetch(
    SITE_SETTINGS_QUERY,
    {},
    { next: { revalidate: REVALIDATE, tags: ["copy"] } },
  );
  return str(row?.strap, DEFAULT_STRAP);
});

export const getAboutContent = cache(async (): Promise<AboutContent> => {
  const row = await client.fetch(
    ABOUT_QUERY,
    {},
    { next: { revalidate: REVALIDATE, tags: ["copy"] } },
  );
  return {
    title: str(row?.title, aboutStatement.title),
    body: blocks(row?.body, aboutBodyBlocks()),
    image: aboutImage(row?.image),
  };
});

export const getSubmitContent = cache(async (): Promise<SubmitContent> => {
  const row = await client.fetch(
    SUBMIT_QUERY,
    {},
    { next: { revalidate: REVALIDATE, tags: ["copy"] } },
  );
  return {
    body: blocks(row?.body, submitBodyBlocks()),
    formUrl: str(row?.formUrl, SUBMIT_FORM_URL),
    blurb: blocks(row?.blurb, submitBlurbBlocks()),
  };
});
