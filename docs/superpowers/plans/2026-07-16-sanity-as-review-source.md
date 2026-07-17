# Sanity as the Review Source — Implementation Plan (Plan 2 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the live site's reviews from the in-repo mock fixture to Sanity, give Bryan a Studio to write in, and retire the dead Airtable review path.

**Architecture:** A `review` document type mirrors the `Review` contract from Plan 1 exactly. `lib/reviews-source.ts` — the single seam Plan 1 established — swaps its body from the fixture to a GROQ query; no page or component changes. Studio is embedded at `/studio`. Images move to Sanity's CDN, so `/api/photo` and the Airtable read die.

**Tech Stack:** `next-sanity`, `sanity`, `@sanity/vision`, `@sanity/image-url`, `@portabletext/react` (already installed), GROQ.

**Spec:** `docs/superpowers/specs/2026-07-16-broadway-art-ledger-epic-design.md`

## Global Constraints

- **Project `bnbcebcv`.** Env vars already exist in `.env.local`: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`.
- **Two datasets:** `production` (Bryan's real reviews — stays pristine) and `development` (the 8 seeded fakes). Fabricated data never enters `production`.
- **⚠️ MANUAL PREREQUISITE (Task 0):** `development` must be created by Josh — the write token lacks the `sanity.project.datasets/create` grant (verified: HTTP 401).
- **Do not change** the `Review` contract from Plan 1. Sanity conforms to it, not the reverse.
- **Never echo secrets.** Tokens stay in gitignored `.env.local`, read via `process.env`.
- Build gate for every task: `npx tsc --noEmit && npm run build`.

---

### Task 0: Create the `development` dataset (MANUAL — Josh)

The write token is a project token scoped to dataset content; dataset creation is a project-admin grant it does not carry.

- [ ] **Step 1: Create it** — either in the Sanity dashboard (`sanity.io/manage` → project `bnbcebcv` → Datasets → Add), or via CLI:

```bash
npx sanity login
npx sanity dataset create development
```

- [ ] **Step 2: Verify**

```bash
node --env-file=.env.local -e "fetch(\`https://\${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2021-06-07/datasets\`,{headers:{Authorization:\`Bearer \${process.env.SANITY_API_READ_TOKEN}\`}}).then(r=>r.json()).then(d=>console.log(d.map(x=>x.name).join(', ')))"
```

Expected: `production, development`

- [ ] **Step 3: Point local at `development`**

In `.env.local`, change `NEXT_PUBLIC_SANITY_DATASET=production` → `development`. Vercel's env keeps `production`, so the deployed Studio edits real content while local edits fakes.

---

### Task 1: Sanity schema + embedded Studio

**Files:**
- Create: `sanity/env.ts`, `sanity/schema.ts`, `sanity/schemas/review.ts`, `sanity/client.ts`, `sanity/image.ts`
- Create: `sanity.config.ts`
- Create: `app/studio/[[...tool]]/page.tsx`
- Modify: `package.json`

**Interfaces:**
- Produces: `client` (read) from `@/sanity/client`; `urlFor(source)` from `@/sanity/image`; the `review` schema; Studio at `/studio`.

- [ ] **Step 1: Install**

```bash
npm install sanity next-sanity @sanity/vision @sanity/image-url styled-components
```

- [ ] **Step 2: Env accessor** — `sanity/env.ts`:

```ts
export const apiVersion = "2024-10-01";

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing NEXT_PUBLIC_SANITY_PROJECT_ID",
);

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}
```

- [ ] **Step 3: The `review` schema** — `sanity/schemas/review.ts`. Mirrors the Plan 1 contract exactly.

```ts
import { defineField, defineType } from "sanity";

export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: "The review's own title.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "headline", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "showName",
      title: "Show / institution",
      type: "string",
      description:
        'Appears in the dateline before the run dates, e.g. "Alex Berns" in "Alex Berns, May 15–June 13, 2026".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "startDate",
      title: "Run starts",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
    }),
    defineField({
      name: "endDate",
      title: "Run ends",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
    }),
    defineField({
      name: "showUrl",
      title: "Show link",
      type: "url",
      description: "The dateline links here. Leave blank and it renders as plain text.",
    }),
    defineField({
      name: "tagline",
      title: "Tagline (optional)",
      type: "text",
      rows: 2,
      description: "Leave blank for no teaser — blank is the default. Fill it in and it appears.",
    }),
    defineField({
      name: "heroImage",
      title: "Marquee image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "caption",
          title: "Caption",
          type: "text",
          rows: 2,
          description: "Shown beneath the image, aligned to its edges.",
        }),
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describes the image for screen readers. Not shown on the page.",
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      description: "Orders the feed — newest first.",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "headline", subtitle: "showName", media: "heroImage" },
  },
});
```

- [ ] **Step 4: Schema index** — `sanity/schema.ts`:

```ts
import type { SchemaTypeDefinition } from "sanity";
import { review } from "./schemas/review";

export const schema: { types: SchemaTypeDefinition[] } = { types: [review] };
```

- [ ] **Step 5: Studio config** — `sanity.config.ts`:

```ts
"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schema";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
});
```

- [ ] **Step 6: Studio route** — `app/studio/[[...tool]]/page.tsx`:

```tsx
import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export const dynamic = "force-static";
export const metadata = { title: "Studio — The Broadway Art Ledger" };

export default function StudioPage() {
  return <NextStudio config={config} />;
}
```

- [ ] **Step 7: Read client** — `sanity/client.ts`:

```ts
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
```

- [ ] **Step 8: Image URL builder** — `sanity/image.ts`:

```ts
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { dataset, projectId } from "./env";

const builder = imageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
```

- [ ] **Step 9: Build + open Studio**

Run: `npx tsc --noEmit && npm run build`, then `npm run dev` and open `http://localhost:3000/studio`.
Expected: Studio loads, prompts Sanity login, and shows a "Review" document type.

- [ ] **Step 10: Commit**

```bash
git add sanity sanity.config.ts app/studio package.json package-lock.json
git commit -m "Add Sanity review schema and embedded Studio at /studio"
```

---

### Task 2: Seed the 8 fakes into `development`

**Files:**
- Create: `scripts/sanity-seed.mts`

- [ ] **Step 1: Write the seed script**

Uploads each `public/art` image as a real Sanity asset, then creates a `review` document per legacy seed entry. Idempotent via deterministic `_id`s. Refuses to run against `production`.

```ts
// Seeds the 8 legacy CC0 reviews into the DEVELOPMENT dataset, to prove the
// content contract end-to-end (including the image pipeline).
//
// Run dates and show URLs are FABRICATED. This must never touch production —
// the guard below enforces it.
//
// Run: node --env-file=.env.local --import tsx scripts/sanity-seed.mts
import { readFileSync } from "node:fs";
import { createClient } from "@sanity/client";
import { reviews as legacy } from "../content/reviews";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const token = process.env.SANITY_API_WRITE_TOKEN!;

if (dataset === "production") {
  throw new Error(
    "Refusing to seed fabricated reviews into production. Set NEXT_PUBLIC_SANITY_DATASET=development.",
  );
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });

// Fabricated run dates, one per slug — scaffolding only.
const RUNS: Record<string, [string, string, string]> = {};
function runFor(slug: string, iso: string): [string, string, string] {
  if (RUNS[slug]) return RUNS[slug];
  const start = new Date(iso);
  start.setDate(start.getDate() - 40);
  const end = new Date(iso);
  end.setDate(end.getDate() + 20);
  const f = (d: Date) => d.toISOString().slice(0, 10);
  return [f(start), f(end), ""];
}

for (const r of legacy) {
  const file = r.image.replace(/^\//, "");
  const asset = await client.assets.upload("image", readFileSync(file), {
    filename: file.split("/").pop(),
  });

  const [startDate, endDate, showUrl] = runFor(r.slug, r.iso);

  const doc = {
    _id: `review-${r.slug}`,
    _type: "review",
    headline: r.title,
    slug: { _type: "slug", current: r.slug },
    showName: r.exhibition,
    startDate,
    endDate,
    showUrl,
    tagline: "",
    heroImage: {
      _type: "image",
      asset: { _type: "reference", _ref: asset._id },
      alt: r.alt,
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
  };

  await client.createOrReplace(doc);
  console.log("seeded", r.slug);
}
console.log(`done — ${legacy.length} reviews in ${dataset}`);
```

- [ ] **Step 2: Run it** (requires Task 0 complete and `.env.local` pointing at `development`)

Run: `node --env-file=.env.local --import tsx scripts/sanity-seed.mts`
Expected: 8 `seeded <slug>` lines, then `done — 8 reviews in development`.

- [ ] **Step 3: Commit**

```bash
git add scripts/sanity-seed.mts
git commit -m "Add Sanity seed script (development only, guards against production)"
```

---

### Task 3: Read reviews from Sanity

The payoff of Plan 1's seam: only `lib/reviews-source.ts` changes.

**Files:**
- Modify: `lib/reviews-source.ts`
- Create: `sanity/queries.ts`

- [ ] **Step 1: The GROQ query** — `sanity/queries.ts`:

```ts
import { defineQuery } from "next-sanity";

// Newest first — Bryan: "Make sure that the most recent review is always at the
// top." Only published docs (drafts carry a `drafts.` id prefix).
export const REVIEWS_QUERY = defineQuery(`
  *[_type == "review" && !(_id in path("drafts.**"))] | order(publishedAt desc) {
    "slug": slug.current,
    headline,
    showName,
    startDate,
    endDate,
    showUrl,
    tagline,
    body,
    publishedAt,
    heroImage {
      alt,
      caption,
      asset->{ url, "dimensions": metadata.dimensions }
    }
  }
`);
```

- [ ] **Step 2: Swap the source** — replace `lib/reviews-source.ts`:

```ts
import type { Review } from "@/content/review";
import { client } from "@/sanity/client";
import { REVIEWS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";

// The live site's data source. Reviews come from Sanity; the Review contract is
// unchanged from Plan 1, so no page or component needed touching.
//
// Tagged so /api/revalidate can flush it the moment Bryan publishes.
const REVALIDATE = 60;

type Row = {
  slug: string | null;
  headline: string | null;
  showName: string | null;
  startDate: string | null;
  endDate: string | null;
  showUrl: string | null;
  tagline: string | null;
  body: unknown;
  publishedAt: string | null;
  heroImage: {
    alt: string | null;
    caption: string | null;
    asset: { url: string | null; dimensions: { width: number; height: number } | null } | null;
  } | null;
};

const s = (v: unknown): string => (typeof v === "string" ? v : "");

export async function getReviews(): Promise<Review[]> {
  const rows = await client.fetch<Row[]>(
    REVIEWS_QUERY,
    {},
    { next: { revalidate: REVALIDATE, tags: ["reviews"] } },
  );

  return (rows ?? [])
    .filter((r) => r.slug && r.heroImage?.asset?.url)
    .map((r) => {
      const dim = r.heroImage?.dimensions ?? r.heroImage?.asset?.dimensions ?? null;
      const width = dim?.width ?? 1200;
      const height = dim?.height ?? 900;
      return {
        slug: s(r.slug),
        headline: s(r.headline),
        showName: s(r.showName),
        startDate: s(r.startDate),
        endDate: s(r.endDate),
        showUrl: s(r.showUrl),
        tagline: s(r.tagline),
        publishedAt: s(r.publishedAt),
        body: (Array.isArray(r.body) ? r.body : []) as Review["body"],
        image: {
          // Serve a sensibly-sized image from Sanity's CDN rather than the
          // full original; the aspect ratio is preserved.
          url: urlFor(r.heroImage as never).width(1600).fit("max").auto("format").url(),
          width,
          height,
          alt: s(r.heroImage?.alt) || s(r.headline),
          caption: s(r.heroImage?.caption),
        },
      };
    });
}
```

- [ ] **Step 3: Verify against the seeded dataset**

Run: `npm run dev`, open `/` and `/archive`.
Expected: the 8 seeded reviews render, newest first, with images from `cdn.sanity.io`. Archive search still works.

- [ ] **Step 4: Verify the empty state**

Temporarily set `NEXT_PUBLIC_SANITY_DATASET=production` (which is empty) and reload `/`.
Expected: header + strap + nav, no crash, no reviews. Restore to `development` after.

- [ ] **Step 5: Commit**

```bash
git add lib/reviews-source.ts sanity/queries.ts
git commit -m "Read reviews from Sanity"
```

---

### Task 4: Publish-to-live revalidation

`/api/revalidate` is dead code today — `REVALIDATE_SECRET` is set nowhere, so it returns "not configured" and bails.

**Files:**
- Modify: `.env.local` (not committed)

- [ ] **Step 1: Generate a secret**

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Add to `.env.local` as `REVALIDATE_SECRET=<value>`, and to Vercel's project env vars.

- [ ] **Step 2: Verify the endpoint responds**

```bash
curl -s -X POST "http://localhost:3000/api/revalidate?secret=<value>"
```

Expected: a JSON `ok: true` rather than `"REVALIDATE_SECRET is not configured"`.

- [ ] **Step 3: Point Sanity at it (MANUAL — Josh, after deploy)**

sanity.io/manage → project `bnbcebcv` → API → Webhooks → Create:
- URL: `https://<domain>/api/revalidate?secret=<value>`
- Dataset: `production`, Trigger on: create/update/delete, Filter: `_type == "review"`

- [ ] **Step 4: Commit** (nothing to commit — env only; note it in the spec)

---

### Task 5: Retire the dead Airtable review path

**Files:**
- Delete: `lib/reviews-data.ts`, `app/api/photo/`
- Modify: `docs/superpowers/specs/...` (mark Phase 2 done)

- [ ] **Step 1: Confirm nothing imports them**

Run: `grep -rn "reviews-data\|api/photo" app/ lib/ components/ themes/ lab/ content/`
Expected: no output.

- [ ] **Step 2: Delete**

```bash
git rm -r lib/reviews-data.ts app/api/photo
```

- [ ] **Step 3: Full gate**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git commit -m "Retire the Airtable review read path and the photo proxy"
```

---

## Self-Review

**Spec coverage:** Phase 2 (Sanity schema, Studio, seed, read, revalidation) → Tasks 1–4 ✓. Phase 5 cutover (retire Airtable/photo proxy) → Task 5 ✓. Domain → deferred by Josh, out of scope.

**Type consistency:** `getReviews(): Promise<Review[]>` keeps Plan 1's signature exactly, so `/` and `/archive` are untouched. `urlFor` from `sanity/image.ts` used in `reviews-source.ts`. `REVIEWS_QUERY` field names match the `review` schema field-for-field.

**Known risk:** Task 0 is a hard manual prerequisite — Tasks 2–3's verification cannot run until `development` exists.
