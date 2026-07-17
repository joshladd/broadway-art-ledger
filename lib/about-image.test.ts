import { test } from "node:test";
import assert from "node:assert/strict";
import { aboutImage, ABOUT_IMAGE_WIDTH } from "./about-image";

test("aboutImage returns null when no image/asset/url", () => {
  assert.equal(aboutImage(null), null);
  assert.equal(aboutImage(undefined), null);
  assert.equal(aboutImage({}), null);
  assert.equal(aboutImage({ asset: null }), null);
  assert.equal(aboutImage({ asset: { url: "" } }), null);
  assert.equal(aboutImage({ asset: { url: 123 } }), null);
});

test("aboutImage sizes the CDN url and carries real dimensions", () => {
  const img = aboutImage({
    alt: "a caption",
    asset: { url: "https://cdn.sanity.io/images/p/d/x-447x298.png", dimensions: { width: 447, height: 298 } },
  });
  assert.ok(img);
  assert.equal(img!.url, `https://cdn.sanity.io/images/p/d/x-447x298.png?w=${ABOUT_IMAGE_WIDTH}&fit=max&auto=format`);
  assert.equal(img!.width, 447);
  assert.equal(img!.height, 298);
  assert.equal(img!.alt, "a caption");
});

test("aboutImage falls back to a sane size when dimensions are missing", () => {
  const img = aboutImage({ asset: { url: "https://cdn.sanity.io/images/p/d/x.png" } });
  assert.ok(img);
  assert.equal(img!.width, ABOUT_IMAGE_WIDTH);
  assert.equal(img!.height, Math.round((ABOUT_IMAGE_WIDTH * 2) / 3));
  assert.equal(img!.alt, ""); // no alt -> empty (decorative), never undefined
});

test("aboutImage appends with & when the url already has a query", () => {
  const img = aboutImage({ asset: { url: "https://cdn.sanity.io/x.png?v=2" } });
  assert.ok(img!.url.includes("?v=2&w="));
});
