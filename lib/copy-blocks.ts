import type { PortableTextBlock } from "@portabletext/types";
// Relative, not "@/": this module is shared with scripts/sanity-seed-copy.mts,
// which runs under tsx where the "@/" alias isn't resolved.
import {
  PUBLICATION,
  aboutStatement,
  submitGuide,
  CONTACT_EMAIL,
  JARGON_ESSAY_URL,
} from "../content/site";

// The default site copy, expressed as Portable Text.
//
// This is the ONE place Bryan's About/Submit copy is turned into blocks. Both
// the Sanity seed (scripts/sanity-seed-copy.mts) and the runtime fallback
// (lib/site-content.ts) call these builders, so a page renders identically
// whether it reads a seeded singleton or the built-in default. Keys are
// deterministic — no Date.now()/random — so re-seeding replaces cleanly.
//
// Source of truth for the strings themselves stays content/site.ts (Bryan's
// verbatim copy). These builders only add the emphasis and links his source
// already implies: the italicized publication title in the About statement,
// the International Art English essay link in the jargon guideline, and the
// mailto on the contact address.

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type MarkDef = { _type: "link"; _key: string; href: string };

function block(
  key: string,
  children: Span[],
  extra: Partial<PortableTextBlock> = {},
  markDefs: MarkDef[] = [],
): PortableTextBlock {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs,
    children,
    ...extra,
  } as PortableTextBlock;
}

function span(key: string, text: string, marks: string[] = []): Span {
  return { _type: "span", _key: key, text, marks };
}

// A plain paragraph, no marks.
function paragraph(key: string, text: string): PortableTextBlock {
  return block(key, [span(`${key}s0`, text)]);
}

// A heading block (h1/h2/...). The Submit body renders its own hierarchy now,
// so titles are headings inside the rich text rather than separate fields.
function heading(key: string, text: string, style: string): PortableTextBlock {
  return block(key, [span(`${key}s0`, text)], { style });
}

// A paragraph that italicizes every literal occurrence of the publication
// title, reproducing the old withEmphasis() renderer exactly.
function emphasizedParagraph(key: string, text: string): PortableTextBlock {
  const parts = text.split(PUBLICATION);
  const children: Span[] = [];
  parts.forEach((part, i) => {
    if (i > 0) children.push(span(`${key}e${i}`, PUBLICATION, ["em"]));
    if (part) children.push(span(`${key}s${i}`, part));
  });
  return block(key, children);
}

export function aboutBodyBlocks(): PortableTextBlock[] {
  return aboutStatement.body.map((text, i) =>
    emphasizedParagraph(`about${i}`, text),
  );
}

function submitIntroBlocks(): PortableTextBlock[] {
  return submitGuide.intro.map((text, i) => paragraph(`intro${i}`, text));
}

// The jargon guideline carries an inline link to the International Art English
// essay, matching the parenthetical the old renderer appended in JSX.
const JARGON_BULLET =
  "Avoid making your piece read like a press release, and avoid jargon.";

function submitGuidelineBlocks(): PortableTextBlock[] {
  return submitGuide.guidelines.map((text, i) => {
    const key = `guide${i}`;
    const listProps = { listItem: "bullet" as const, level: 1 };
    if (text !== JARGON_BULLET) {
      return block(key, [span(`${key}s0`, text)], listProps);
    }
    const linkKey = `${key}link`;
    return block(
      key,
      [
        span(`${key}s0`, `${text} (`),
        span(`${key}s1`, "This essay", [linkKey]),
        span(`${key}s2`, " on International Art English is a great reference point.)"),
      ],
      listProps,
      [{ _type: "link", _key: linkKey, href: JARGON_ESSAY_URL }],
    );
  });
}

// The whole Submit guide as one rich-text body: title, intro, guidelines
// heading, and the bulleted list — the layout Bryan edits in one field.
export function submitBodyBlocks(): PortableTextBlock[] {
  return [
    heading("stitle", submitGuide.pitchGuideTitle, "h1"),
    ...submitIntroBlocks(),
    heading("gtitle", submitGuide.guidelinesTitle, "h2"),
    paragraph("gintro", submitGuide.guidelinesIntro),
    ...submitGuidelineBlocks(),
  ];
}

// The little blurb under the form button: the contact line, with the email as
// a mailto link.
export function submitBlurbBlocks(): PortableTextBlock[] {
  const linkKey = "blurblink";
  return [
    block(
      "blurb0",
      [
        span("blurb0s0", `${submitGuide.outro.before} `),
        span("blurb0s1", CONTACT_EMAIL, [linkKey]),
        span("blurb0s2", ` ${submitGuide.outro.after}`),
      ],
      {},
      [{ _type: "link", _key: linkKey, href: `mailto:${CONTACT_EMAIL}` }],
    ),
  ];
}
