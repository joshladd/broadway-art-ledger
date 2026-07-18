import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseSearchTerms,
  buildSearchPattern,
  splitOnTerms,
  MAX_QUERY_LENGTH,
  MAX_TERMS,
} from "./search";

test("parseSearchTerms: splits on whitespace, drops blanks", () => {
  assert.deepEqual(parseSearchTerms("van gogh"), ["van", "gogh"]);
  assert.deepEqual(parseSearchTerms("  van   gogh  "), ["van", "gogh"]);
  assert.deepEqual(parseSearchTerms(""), []);
  assert.deepEqual(parseSearchTerms("   "), []);
});

test("parseSearchTerms: caps query length and term count", () => {
  const long = "a".repeat(MAX_QUERY_LENGTH + 50);
  assert.equal(parseSearchTerms(long)[0].length, MAX_QUERY_LENGTH);
  const many = Array.from({ length: MAX_TERMS + 20 }, (_, i) => `w${i}`).join(" ");
  assert.equal(parseSearchTerms(many).length, MAX_TERMS);
});

test("buildSearchPattern: prefix-matches each term", () => {
  assert.equal(buildSearchPattern(["van", "gogh"]), "van* gogh*");
  assert.equal(buildSearchPattern([]), "");
});

test("splitOnTerms: flags matching segments, case-insensitive", () => {
  const segs = splitOnTerms("Van Gogh in Arles", ["van"]);
  assert.deepEqual(
    segs.filter((s) => s.match).map((s) => s.value),
    ["Van"],
  );
  assert.equal(segs.map((s) => s.value).join(""), "Van Gogh in Arles"); // lossless
});

test("splitOnTerms: no terms -> whole text, unmatched", () => {
  assert.deepEqual(splitOnTerms("hello", []), [{ value: "hello", match: false }]);
});

test("splitOnTerms: regex-special terms are escaped (no injection/ReDoS)", () => {
  // "c++" must be treated literally, not as regex quantifiers.
  const segs = splitOnTerms("I love c++ code", ["c++"]);
  assert.deepEqual(
    segs.filter((s) => s.match).map((s) => s.value),
    ["c++"],
  );
});
