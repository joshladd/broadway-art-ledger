// Seeds the 8 legacy CC0 reviews into the DEVELOPMENT dataset, proving the
// content contract end-to-end including the image pipeline.
//
// The run dates and show URLs here are FABRICATED — the legacy seed has only a
// single publish date, and the live model needs a run. That is exactly why this
// must never touch `production`: the guard below refuses.
//
// Idempotent: deterministic _ids mean re-running replaces rather than
// duplicates. Image assets are de-duplicated by Sanity on content hash.
//
// Run: node --env-file=.env.local --import tsx scripts/sanity-seed.mts
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { reviews as legacy } from "../content/reviews";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_WRITE_TOKEN",
  );
}

if (dataset === "production") {
  throw new Error(
    "Refusing to seed fabricated reviews into production.\n" +
      "Set NEXT_PUBLIC_SANITY_DATASET=development in .env.local first.",
  );
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

// Fabricate a plausible run around the legacy publish date: opened ~40 days
// before, closes ~20 days after. Scaffolding only — real runs come from Bryan.
function fabricateRun(iso: string): { startDate: string; endDate: string } {
  const day = 86_400_000;
  const t = Date.parse(iso);
  const f = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  return { startDate: f(t - 40 * day), endDate: f(t + 20 * day) };
}

let count = 0;
for (const r of legacy) {
  // The legacy seed stores web paths ("/art/art-01.jpg"); on disk they live
  // under public/.
  const file = `public${r.image}`;
  const asset = await client.assets.upload("image", readFileSync(file), {
    filename: file.split("/").pop(),
  });

  const { startDate, endDate } = fabricateRun(r.iso);

  await client.createOrReplace({
    _id: `review-${r.slug}`,
    _type: "review",
    headline: r.title,
    slug: { _type: "slug", current: r.slug },
    // Legacy `exhibition` held the institution — that's the dateline label now.
    showName: r.exhibition,
    startDate,
    endDate,
    showUrl: "",
    tagline: "",
    heroImage: {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
      alt: r.alt,
      // The legacy credit line is the closest thing to a writer's caption.
      caption: r.credit,
    },
    body: r.body.map((text, i) => ({
      _type: "block",
      _key: `b${i}`,
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: `s${i}`, text, marks: [] }],
    })),
    publishedAt: new Date(r.iso).toISOString(),
  });

  count += 1;
  console.log(`seeded ${r.slug}`);
}

console.log(`done — ${count} reviews in "${dataset}"`);
