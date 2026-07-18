import { test } from "node:test";
import assert from "node:assert/strict";
import { clampOffset, pageResult } from "./pagination";

test("clampOffset: floors to a non-negative integer", () => {
  assert.equal(clampOffset(0), 0);
  assert.equal(clampOffset(10), 10);
  assert.equal(clampOffset(10.9), 10);
  assert.equal(clampOffset(-5), 0);
});

test("clampOffset: non-finite -> 0", () => {
  assert.equal(clampOffset(NaN), 0);
  assert.equal(clampOffset(Infinity), 0);
  assert.equal(clampOffset(-Infinity), 0);
});

test("pageResult: a full page implies more", () => {
  const r = pageResult([1, 2, 3], 0, 3);
  assert.deepEqual(r, { items: [1, 2, 3], hasMore: true, nextOffset: 3 });
});

test("pageResult: a short page is the last", () => {
  const r = pageResult([1, 2], 10, 3);
  assert.deepEqual(r, { items: [1, 2], hasMore: false, nextOffset: 12 });
});

test("pageResult: an empty page ends paging", () => {
  const r = pageResult([], 30, 10);
  assert.deepEqual(r, { items: [], hasMore: false, nextOffset: 30 });
});
