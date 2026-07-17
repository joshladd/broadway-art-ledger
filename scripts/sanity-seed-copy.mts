// Seeds the three copy singletons (site settings, About, Submit) from Bryan's
// verbatim copy in content/site.ts, converted to Portable Text by the shared
// builders in lib/copy-blocks.ts.
//
// Unlike the reviews seed, this copy is REAL — it's Bryan's own words — so there
// is no production guard. Seeding it anywhere just makes the editable copy match
// what the fallback already renders. Idempotent: fixed _ids replace in place.
//
// Run: node --env-file=.env.local --import tsx scripts/sanity-seed-copy.mts
import { createClient } from "@sanity/client";
import { strap, aboutStatement, submitGuide, SUBMIT_FORM_URL } from "../content/site";
import {
  aboutBodyBlocks,
  submitIntroBlocks,
  submitGuidelineBlocks,
  submitOutroBlocks,
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
  },
  {
    _id: "submitPage",
    _type: "submitPage",
    pitchGuideTitle: submitGuide.pitchGuideTitle,
    intro: submitIntroBlocks(),
    guidelinesTitle: submitGuide.guidelinesTitle,
    guidelinesIntro: submitGuide.guidelinesIntro,
    guidelines: submitGuidelineBlocks(),
    formUrl: SUBMIT_FORM_URL,
    outro: submitOutroBlocks(),
  },
];

for (const doc of docs) {
  await client.createOrReplace(doc);
  console.log(`seeded ${doc._id}`);
}

console.log(`done — ${docs.length} singletons in "${dataset}"`);
