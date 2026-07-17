// Removes every seeded demo review from whichever dataset the env names.
//
// Safe by construction: the seed script writes deterministic ids of the form
// `review-<slug>`, so this only ever deletes documents it can prove came from
// the seed. Anything Bryan writes in Studio gets a random id and is untouched.
//
// Run: node --env-file=.env.local --import tsx scripts/sanity-purge-seed.mts
import { createClient } from "@sanity/client";
import { reviews as legacy } from "../content/reviews";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET / SANITY_API_WRITE_TOKEN");
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });

const ids = legacy.map((r) => `review-${r.slug}`);
console.log(`purging ${ids.length} seeded reviews from ${projectId}/${dataset}…`);

let tx = client.transaction();
for (const id of ids) tx = tx.delete(id);
await tx.commit();

const left = await client.fetch<number>('count(*[_type == "review"])');
console.log(`done — ${left} review document(s) remain in ${dataset}`);
