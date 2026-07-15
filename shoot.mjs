import { chromium } from "playwright";
import { mkdirSync } from "fs";

const themes = ["ledger", "kunsthalle", "broadside", "nocturne", "index", "marquee", "plate", "riso"];
const base = process.env.BASE || "http://localhost:3009";
const slug = "van-gogh-in-arles";

mkdirSync("shots", { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1500 } });

for (const t of themes) {
  for (const [name, path] of [
    ["home", `/t/${t}`],
    ["review", `/t/${t}/r/${slug}`],
  ]) {
    try {
      await page.goto(base + path, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(700);
      await page.screenshot({ path: `shots/${t}-${name}.png` });
      console.log("shot", t, name);
    } catch (e) {
      console.log("FAIL", t, name, e.message);
    }
  }
}
await browser.close();
console.log("done");
