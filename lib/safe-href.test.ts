import { test } from "node:test";
import assert from "node:assert/strict";
import { safeHref, isExternal } from "./safe-href";

test("safeHref allows http(s), mailto, and relative URLs", () => {
  assert.equal(safeHref("https://example.com/x"), "https://example.com/x");
  assert.equal(safeHref("http://example.com"), "http://example.com");
  assert.equal(safeHref("mailto:a@b.com"), "mailto:a@b.com");
  assert.equal(safeHref("/reviews/x"), "/reviews/x");
  assert.equal(safeHref("#anchor"), "#anchor");
  assert.equal(safeHref("?q=1"), "?q=1");
});

test("safeHref blocks dangerous schemes -> null", () => {
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("JavaScript:alert(1)"), null);
  assert.equal(safeHref("  javascript:alert(1)  "), null);
  assert.equal(safeHref("data:text/html,<script>"), null);
  assert.equal(safeHref("vbscript:msgbox"), null);
});

test("safeHref rejects non-strings and blanks", () => {
  assert.equal(safeHref(null), null);
  assert.equal(safeHref(undefined), null);
  assert.equal(safeHref(123), null);
  assert.equal(safeHref(""), null);
  assert.equal(safeHref("   "), null);
});

test("safeHref trims surrounding whitespace on valid URLs", () => {
  assert.equal(safeHref("  https://example.com  "), "https://example.com");
});

test("isExternal is true only for http(s)", () => {
  assert.equal(isExternal("https://example.com"), true);
  assert.equal(isExternal("http://example.com"), true);
  assert.equal(isExternal("mailto:a@b.com"), false);
  assert.equal(isExternal("/reviews/x"), false);
});
