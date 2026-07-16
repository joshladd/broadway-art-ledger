// End-to-end smoke test: drives a real browser through the reader journey and a
// live pitch submission (which writes to Airtable). Run against a running server:
//   node scripts/e2e.mjs           (defaults to http://127.0.0.1:3020)
import { chromium } from "playwright";

const BASE = process.env.BASE || "http://127.0.0.1:3020";
export const TEST_SHOW = "E2E-PW-TEST-DELETE-ME";
let pass = 0, fail = 0;
const check = (cond, msg) => { if (cond) { pass++; console.log("  ✓", msg); } else { fail++; console.log("  ✗ FAIL:", msg); } };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

console.log("Flow 1 — reader journey");
await page.goto(`${BASE}/`, { waitUntil: "load" });
check((await page.locator("a[href^='/t/']").count()) >= 8, "picker lists all 8 designs");

await page.goto(`${BASE}/t/index`, { waitUntil: "load" });
check(await page.getByText("Toulouse-Lautrec: Night Work").first().isVisible(), "feed shows a big bold review title");
check(await page.getByText(/too honest to leave himself out of the transaction/i).first().isVisible(), "full review renders inline (not a teaser)");
check(await page.locator("img").first().isVisible(), "marquee image renders");

await page.goto(`${BASE}/t/index/about`, { waitUntil: "load" });
check(await page.getByText(/solely focused on art criticism/i).first().isVisible(), "About page renders");

await page.goto(`${BASE}/t/index/submit`, { waitUntil: "load" });
check(await page.locator("form[action='/api/pitch']").isVisible(), "Submit form renders");

console.log("Flow 2 — submission journey (writes to Airtable)");
await page.fill("input[name='show']", TEST_SHOW);
await page.fill("input[name='venue']", "Test Gallery, Test Hood");
await page.selectOption("select[name='section']", "Painting").catch(() => {});
await page.fill("textarea[name='pitch']", "An automated Playwright e2e pitch verifying the branded form writes to Airtable.");
await page.fill("input[name='name']", "PW Bot").catch(() => {});
await page.fill("input[name='email']", "e2e@example.com");
await Promise.all([
  page.waitForURL(/sent=1/, { timeout: 20000 }),
  page.click("button[type='submit']"),
]);
check(/sent=1/.test(page.url()), "submitting the form redirected to the confirmation");
check(await page.getByText(/thank you/i).first().isVisible(), "confirmation message is shown");

await browser.close();
console.log(`\nUI checks: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
