import test from "node:test";
import assert from "node:assert/strict";
import { formatRange } from "./format-date";

test("same year, different months — Bryan's example", () => {
  assert.equal(formatRange("2026-05-15", "2026-06-13"), "May 15–June 13, 2026");
});

test("same month and year — CMOS collapses the repeated month", () => {
  assert.equal(formatRange("2026-05-15", "2026-05-27"), "May 15–27, 2026");
});

test("spanning years — both years shown", () => {
  assert.equal(
    formatRange("2025-12-10", "2026-01-20"),
    "December 10, 2025–January 20, 2026",
  );
});

test("uses an en dash, never a hyphen", () => {
  assert.ok(formatRange("2026-05-15", "2026-06-13").includes("–"));
  assert.ok(!formatRange("2026-05-15", "2026-06-13").includes("-"));
});

test("missing end date renders the start alone", () => {
  assert.equal(formatRange("2026-05-15", ""), "May 15, 2026");
});

test("missing start date renders empty", () => {
  assert.equal(formatRange("", "2026-05-15"), "");
});

test("does not drift across timezones (no Date parsing)", () => {
  // A naive `new Date("2026-01-01")` is UTC midnight, which is Dec 31 for any
  // user west of UTC. The formatter must not shift the day.
  assert.equal(formatRange("2026-01-01", "2026-01-31"), "January 1–31, 2026");
});
