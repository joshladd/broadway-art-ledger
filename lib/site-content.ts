import { cache } from "react";
import type { PortableTextBlock } from "@portabletext/types";
import { client } from "@/sanity/client";
import { SITE_SETTINGS_QUERY, ABOUT_QUERY, SUBMIT_QUERY } from "@/sanity/queries";
import {
  strap as DEFAULT_STRAP,
  aboutStatement,
  submitGuide,
  SUBMIT_FORM_URL,
} from "@/content/site";
import {
  aboutBodyBlocks,
  submitIntroBlocks,
  submitGuidelineBlocks,
  submitOutroBlocks,
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

export type AboutContent = { title: string; body: PortableTextBlock[] };
export type SubmitContent = {
  pitchGuideTitle: string;
  intro: PortableTextBlock[];
  guidelinesTitle: string;
  guidelinesIntro: string;
  guidelines: PortableTextBlock[];
  formUrl: string;
  outro: PortableTextBlock[];
};

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
  };
});

export const getSubmitContent = cache(async (): Promise<SubmitContent> => {
  const row = await client.fetch(
    SUBMIT_QUERY,
    {},
    { next: { revalidate: REVALIDATE, tags: ["copy"] } },
  );
  return {
    pitchGuideTitle: str(row?.pitchGuideTitle, submitGuide.pitchGuideTitle),
    intro: blocks(row?.intro, submitIntroBlocks()),
    guidelinesTitle: str(row?.guidelinesTitle, submitGuide.guidelinesTitle),
    guidelinesIntro: str(row?.guidelinesIntro, submitGuide.guidelinesIntro),
    guidelines: blocks(row?.guidelines, submitGuidelineBlocks()),
    formUrl: str(row?.formUrl, SUBMIT_FORM_URL),
    outro: blocks(row?.outro, submitOutroBlocks()),
  };
});
