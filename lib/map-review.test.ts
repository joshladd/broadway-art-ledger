import test from "node:test";
import assert from "node:assert/strict";
import { mapReviewRows, mapArchiveRows, type ReviewRow, type ArchiveRow } from "./map-review";

// Proves the Sanity -> Review structural contract without needing a dataset:
// these payloads are shaped exactly as the GROQ projection in sanity/queries.ts
// returns them, including the ways a real CMS returns half-finished documents.

const asset = {
  url: "https://cdn.sanity.io/images/bnbcebcv/development/abc-1000x874.jpg",
  dimensions: { width: 1000, height: 874 },
};

function row(over: Partial<ReviewRow> = {}): ReviewRow {
  return {
    slug: "toulouse-lautrec-night-work",
    headline: "Toulouse-Lautrec: Night Work",
    showName: "The Morgan Library & Museum",
    startDate: "2026-05-15",
    endDate: "2026-06-13",
    showUrl: "https://www.themorgan.org/",
    tagline: null,
    body: [
      {
        _type: "block",
        _key: "b1",
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", _key: "s1", text: "The tilt is the tell.", marks: [] }],
      },
    ],
    publishedAt: "2026-07-11T09:00:00.000Z",
    heroImage: { alt: "A crowd at the Moulin Rouge.", caption: "Henri de Toulouse-Lautrec.", asset },
    ...over,
  };
}

test("maps a complete review to the Review contract", () => {
  const [r] = mapReviewRows([row()]);
  assert.equal(r.slug, "toulouse-lautrec-night-work");
  assert.equal(r.headline, "Toulouse-Lautrec: Night Work");
  assert.equal(r.showName, "The Morgan Library & Museum");
  assert.equal(r.startDate, "2026-05-15");
  assert.equal(r.showUrl, "https://www.themorgan.org/");
  assert.equal(r.image.caption, "Henri de Toulouse-Lautrec.");
  assert.equal(r.body.length, 1);
});

test("carries the asset's TRUE dimensions, not a guess", () => {
  // A wrong aspect ratio would visibly distort the marquee image.
  const [r] = mapReviewRows([row()]);
  assert.equal(r.image.width, 1000);
  assert.equal(r.image.height, 874);
});

test("serves the image from Sanity's CDN", () => {
  const [r] = mapReviewRows([row()]);
  assert.ok(r.image.url.startsWith("https://cdn.sanity.io/"));
});

test("a null tagline becomes empty string, so it renders nothing", () => {
  // Bryan's default is no teaser; the component only renders a non-empty one.
  const [r] = mapReviewRows([row({ tagline: null })]);
  assert.equal(r.tagline, "");
});

test("a null showUrl becomes empty string, so the dateline renders unlinked", () => {
  const [r] = mapReviewRows([row({ showUrl: null })]);
  assert.equal(r.showUrl, "");
});

test("drops a review with no image rather than crashing the feed", () => {
  const rows = [row(), row({ slug: "no-image", heroImage: null })];
  assert.equal(mapReviewRows(rows).length, 1);
});

test("drops a review whose asset never resolved", () => {
  const broken = row({
    slug: "broken-asset",
    heroImage: { alt: null, caption: null, asset: { url: null, dimensions: null } },
  });
  assert.equal(mapReviewRows([broken]).length, 0);
});

test("falls back to the headline for alt when alt is missing", () => {
  const [r] = mapReviewRows([
    row({ heroImage: { alt: null, caption: null, asset } }),
  ]);
  assert.equal(r.image.alt, "Toulouse-Lautrec: Night Work");
});

test("survives a document with no body yet", () => {
  const [r] = mapReviewRows([row({ body: null })]);
  assert.deepEqual(r.body, []);
});

test("handles an empty dataset", () => {
  assert.deepEqual(mapReviewRows([]), []);
  assert.deepEqual(mapReviewRows(null), []);
});

test("requests a sized image from the CDN without upscaling or distorting", () => {
  const [r] = mapReviewRows([row()]);
  const u = new URL(r.image.url);
  assert.equal(u.searchParams.get("w"), "1600");
  // fit=max never upscales and preserves the true aspect ratio.
  assert.equal(u.searchParams.get("fit"), "max");
  assert.equal(u.searchParams.get("auto"), "format");
});

// --- mapArchiveRows -------------------------------------------------------
// The archive/search rows deliberately DIVERGE from the feed: an archive row is
// kept as long as it has a slug, even with no image (it renders an empty plate),
// whereas mapReviewRows drops imageless reviews. Lock that contract.

function archiveRow(over: Partial<ArchiveRow> = {}): ArchiveRow {
  return {
    slug: "a-show",
    headline: "A Show",
    showName: "The Gallery",
    tagline: null,
    startDate: "2026-05-01",
    endDate: "2026-06-01",
    imageUrl: "https://cdn.sanity.io/images/p/d/x.png",
    ...over,
  };
}

test("archive: maps a row and sizes both image URLs off the CDN", () => {
  const [item] = mapArchiveRows([archiveRow()]);
  assert.equal(item.headline, "A Show");
  assert.equal(item.showName, "The Gallery");
  assert.match(item.thumbUrl, /x\.png\?w=160&fit=max&auto=format/);
  assert.match(item.heroUrl, /x\.png\?w=1600&fit=max&auto=format/);
});

test("archive: keeps an imageless row (unlike the feed), with empty image URLs", () => {
  const [item] = mapArchiveRows([archiveRow({ imageUrl: null })]);
  assert.equal(item.slug, "a-show");
  assert.equal(item.thumbUrl, "");
  assert.equal(item.heroUrl, "");
});

test("archive: drops a row with no slug", () => {
  assert.equal(mapArchiveRows([archiveRow({ slug: null })]).length, 0);
});

test("archive: null rows -> empty list", () => {
  assert.deepEqual(mapArchiveRows(null), []);
});
