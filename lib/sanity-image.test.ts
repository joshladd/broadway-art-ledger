import { test } from "node:test";
import assert from "node:assert/strict";
import { sanityImageUrl, marqueePrefetchUrl, MARQUEE_WIDTH } from "./sanity-image";

test("sanityImageUrl: empty in -> empty out", () => {
  assert.equal(sanityImageUrl("", 800), "");
});

test("sanityImageUrl: appends sizing params with ? when no query", () => {
  assert.equal(
    sanityImageUrl("https://cdn.sanity.io/images/p/d/x.png", 160),
    "https://cdn.sanity.io/images/p/d/x.png?w=160&fit=max&auto=format",
  );
});

test("sanityImageUrl: appends with & when the url already has a query", () => {
  assert.equal(
    sanityImageUrl("https://cdn.sanity.io/x.png?v=2", MARQUEE_WIDTH),
    `https://cdn.sanity.io/x.png?v=2&w=${MARQUEE_WIDTH}&fit=max&auto=format`,
  );
});

test("marqueePrefetchUrl: DPR 2 targets the 1920 device width", () => {
  // 888 * 2 = 1776 -> first device size >= 1776 is 1920.
  const hero = "https://cdn.sanity.io/x.png?w=1600&fit=max&auto=format";
  const url = marqueePrefetchUrl(hero, 2);
  assert.equal(
    url,
    `/_next/image?url=${encodeURIComponent(hero)}&w=1920&q=75`,
  );
});

test("marqueePrefetchUrl: DPR 1 targets a smaller device width", () => {
  // 888 * 1 = 888 -> first device size >= 888 is 1080.
  const url = marqueePrefetchUrl("https://cdn.sanity.io/x.png", 1);
  assert.match(url, /&w=1080&q=75$/);
});
