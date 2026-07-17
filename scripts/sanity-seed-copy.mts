// Seeds the three copy singletons (site settings, About, Submit) from Bryan's
// verbatim copy in content/site.ts, converted to Portable Text by the shared
// builders in lib/copy-blocks.ts.
//
// Unlike the reviews seed, this copy is REAL — it's Bryan's own words — so there
// is no production guard. Seeding it anywhere just makes the editable copy match
// what the fallback already renders. Idempotent: fixed _ids replace in place.
//
// Run: node --env-file=.env.local --import tsx scripts/sanity-seed-copy.mts
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { strap, aboutStatement, SUBMIT_FORM_URL } from "../content/site";
import {
  aboutBodyBlocks,
  submitBodyBlocks,
  submitBlurbBlocks,
} from "../lib/copy-blocks";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_WRITE_TOKEN",
  );
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-10-01",
  useCdn: false,
});

// Seed the About page with the current (low-res) image so it lives in Sanity;
// Bryan can replace it with a hi-res one from the Studio. Sanity dedupes assets
// by content hash, so re-running is idempotent.
const aboutAsset = await client.assets.upload("image", readFileSync("public/about.png"), {
  filename: "about.png",
});

const docs = [
  {
    _id: "siteSettings",
    _type: "siteSettings",
    strap,
  },
  {
    _id: "aboutPage",
    _type: "aboutPage",
    title: aboutStatement.title,
    body: aboutBodyBlocks(),
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: aboutAsset._id },
      alt: "",
    },
  },
  {
    _id: "submitPage",
    _type: "submitPage",
    body: submitBodyBlocks(),
    formUrl: SUBMIT_FORM_URL,
    blurb: submitBlurbBlocks(),
  },
];

for (const doc of docs) {
  await client.createOrReplace(doc);
  console.log(`seeded ${doc._id}`);
}

console.log(`done — ${docs.length} singletons in "${dataset}"`);
