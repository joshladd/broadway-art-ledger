import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { marks } from "./portable-marks";

// A block whose single word "here" carries a link mark to `href`.
function linkBlock(href: string): PortableTextBlock[] {
  return [
    {
      _type: "block",
      _key: "b0",
      style: "normal",
      markDefs: [{ _type: "link", _key: "l0", href }],
      children: [{ _type: "span", _key: "s0", text: "here", marks: ["l0"] }],
    },
  ] as unknown as PortableTextBlock[];
}

function render(href: string): string {
  return renderToStaticMarkup(<PortableText value={linkBlock(href)} components={{ marks }} />);
}

test("external link opens in a new tab with rel guards", () => {
  assert.match(
    render("https://example.com/x"),
    /<a href="https:\/\/example\.com\/x" target="_blank" rel="noopener noreferrer">here<\/a>/,
  );
});

test("mailto renders in place, no target", () => {
  const html = render("mailto:a@b.com");
  assert.match(html, /<a href="mailto:a@b\.com">here<\/a>/);
  assert.doesNotMatch(html, /target=/);
});

test("relative link renders in place, no target", () => {
  const html = render("/reviews/x");
  assert.match(html, /<a href="\/reviews\/x">here<\/a>/);
  assert.doesNotMatch(html, /target=/);
});

test("javascript: is dropped to plain text (no anchor)", () => {
  const html = render("javascript:alert(1)");
  assert.doesNotMatch(html, /<a/);
  assert.match(html, /here/);
});
