import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aboutBodyBlocks,
  submitBodyBlocks,
  submitBlurbBlocks,
} from "./copy-blocks";
import {
  PUBLICATION,
  aboutStatement,
  submitGuide,
  CONTACT_EMAIL,
  JARGON_ESSAY_URL,
} from "@/content/site";

type Span = { _type: string; _key: string; text: string; marks: string[] };
type Block = {
  _type: string;
  _key: string;
  style?: string;
  listItem?: string;
  markDefs: { _type: string; _key: string; href: string }[];
  children: Span[];
};

function keysOf(blocks: Block[]): string[] {
  return blocks.flatMap((b) => [b._key, ...b.children.map((c) => c._key)]);
}

test("aboutBodyBlocks: one block per source paragraph, deterministic", () => {
  const a = aboutBodyBlocks() as unknown as Block[];
  assert.equal(a.length, aboutStatement.body.length);
  // Deterministic output (no Date/random) so re-seeding replaces cleanly.
  assert.equal(JSON.stringify(aboutBodyBlocks()), JSON.stringify(aboutBodyBlocks()));
});

test("aboutBodyBlocks: keys are unique (safe as Sanity _keys)", () => {
  const keys = keysOf(aboutBodyBlocks() as unknown as Block[]);
  assert.equal(new Set(keys).size, keys.length);
});

test("aboutBodyBlocks: every publication-title occurrence is italicized", () => {
  const blocks = aboutBodyBlocks() as unknown as Block[];
  // Count italic spans whose text is exactly the publication title.
  const emTitleSpans = blocks
    .flatMap((b) => b.children)
    .filter((c) => c.text === PUBLICATION && c.marks.includes("em"));
  // ...and count raw occurrences in the source copy.
  const rawOccurrences = aboutStatement.body.reduce(
    (n, p) => n + p.split(PUBLICATION).length - 1,
    0,
  );
  assert.ok(rawOccurrences > 0, "sanity: the About copy mentions the publication");
  assert.equal(emTitleSpans.length, rawOccurrences);
  // No plain (unmarked) span should equal the title.
  const plainTitle = blocks
    .flatMap((b) => b.children)
    .some((c) => c.text === PUBLICATION && !c.marks.includes("em"));
  assert.equal(plainTitle, false);
});

test("submitBodyBlocks: leads with the H1 title, has the guidelines H2", () => {
  const blocks = submitBodyBlocks() as unknown as Block[];
  assert.equal(blocks[0].style, "h1");
  assert.equal(blocks[0].children[0].text, submitGuide.pitchGuideTitle);
  assert.ok(
    blocks.some((b) => b.style === "h2" && b.children[0].text === submitGuide.guidelinesTitle),
  );
});

test("submitBodyBlocks: one bullet per guideline, jargon bullet carries the essay link", () => {
  const blocks = submitBodyBlocks() as unknown as Block[];
  const bullets = blocks.filter((b) => b.listItem === "bullet");
  assert.equal(bullets.length, submitGuide.guidelines.length);

  const withLink = bullets.find((b) =>
    b.markDefs.some((d) => d._type === "link" && d.href === JARGON_ESSAY_URL),
  );
  assert.ok(withLink, "the jargon guideline should link to the essay");
  // The link markDef key must be referenced by one of the spans' marks.
  const linkKey = withLink!.markDefs.find((d) => d.href === JARGON_ESSAY_URL)!._key;
  assert.ok(withLink!.children.some((c) => c.marks.includes(linkKey)));
});

test("submitBlurbBlocks: contact line with a mailto link", () => {
  const blocks = submitBlurbBlocks() as unknown as Block[];
  assert.equal(blocks.length, 1);
  const def = blocks[0].markDefs.find((d) => d._type === "link");
  assert.ok(def);
  assert.equal(def!.href, `mailto:${CONTACT_EMAIL}`);
  assert.ok(blocks[0].children.some((c) => c.marks.includes(def!._key)));
});
