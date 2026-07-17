# The Broadway Art Ledger

An art-criticism publication for the New York metropolitan area. Reviews run
200–400 words with one marquee image; there's an About/Submissions page and a
blind, anonymous pitch process. Content is managed in Sanity and read by a
Next.js site.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the values (see below)
npm run dev                  # http://localhost:3000
```

Local dev points at the Sanity `development` dataset. Seed it with sample data:

```bash
node --env-file=.env.local --import tsx scripts/sanity-seed.mts        # 8 sample reviews
node --env-file=.env.local --import tsx scripts/sanity-seed-copy.mts   # About/Submit/tagline copy
```

## Architecture

- **Next.js 16 (App Router) + React 19 + TypeScript.** Deployed on Vercel.
- **Content lives in Sanity.**
  - **Reviews** — one document per published review. Edited in the Studio
    embedded at `/studio`.
  - **Editable copy** — three pinned singletons (`siteSettings` tagline,
    `aboutPage`, `submitPage`) so the About/Submit/tagline copy is editable
    without a deploy. `content/site.ts` holds the same copy as a fallback, so
    nothing renders blank before the singletons are seeded.
- **Data flow.** The site reads Sanity through two seams and never elsewhere:
  `lib/reviews-source.ts` (reviews) and `lib/site-content.ts` (copy). Row →
  view-model mapping is pure and unit-tested (`lib/map-review.ts`,
  `lib/copy-blocks.ts`, `lib/about-image.ts`). Pages are static (SSG) and
  refresh via ISR (60s) plus an on-demand webhook (below).
- **Images** come from Sanity's CDN (`cdn.sanity.io`, allowlisted in
  `next.config.mjs`), sized per surface (feed vs. archive thumbnail).
- **Pitches** are handled by a link out to the editor's Airtable form
  (`SUBMIT_FORM_URL` in `content/site.ts`); the app makes no Airtable API calls.
- **Fonts** self-hosted via `next/font`: Fraunces (display), Newsreader (body),
  Space Mono (labels).

### Routes

`/` (feed) · `/archive` (search) · `/reviews/[slug]` (one review) · `/about` ·
`/submit` · `/studio` (embedded Sanity Studio).

The site's routes live in an `app/(site)/` group that owns `globals.css`, so the
site's CSS reset never reaches the Studio (which styles itself).

## Environment

See `.env.example`. Runtime needs `NEXT_PUBLIC_SANITY_PROJECT_ID`,
`NEXT_PUBLIC_SANITY_DATASET`, and `REVALIDATE_SECRET`. `SANITY_API_WRITE_TOKEN`
is only needed to run the seed scripts — the site reads a public dataset with no
token. In production these are provisioned by the Vercel ↔ Sanity integration.

## On-demand revalidation

A Sanity webhook POSTs `POST /api/revalidate?secret=<REVALIDATE_SECRET>` on
publish, flushing the `reviews` and `copy` cache tags so edits appear within
seconds instead of waiting out the ISR window.

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # node --test over lib/**/*.test.ts
npm run build       # production build
```
