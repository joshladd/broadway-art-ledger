# Architecture

The Broadway Art Ledger is a Next.js 16 (App Router) site that reads content from
Sanity and deploys on Vercel. It is deliberately small: a reading surface plus an
embedded CMS.

## Data flow

```
Sanity (content) ──► read seams ──► pure mapping ──► pages/components
  reviews              reviews-source     map-review        app/(site)/*
  copy singletons      site-content       copy-blocks       components/site/*
                                          about-image
```

- **`lib/reviews-source.ts`** and **`lib/site-content.ts`** are the only modules
  that call the Sanity client. Everything downstream receives plain view-models.
- **Mapping is pure** (`lib/map-review.ts`, `lib/copy-blocks.ts`,
  `lib/about-image.ts`): Sanity's loosely-typed rows in, typed view-models out,
  no network. This is why it's unit-tested without a dataset.
- **`content/review.ts`** is the content contract — the review shape the whole
  app agrees on. Sanity's schema (`sanity/schemas/review.ts`) conforms to it.

## Content model

- **Review** (one document each): `headline`, `slug`, `showName` + `startDate`/
  `endDate` (the dateline), optional `showUrl`, optional `tagline`, `heroImage`
  (marquee + caption + alt), `body` (Portable Text), `publishedAt` (ordering).
- **Copy singletons** (one document each, fixed `_id`): `siteSettings` (the
  tagline), `aboutPage` (title + body + optional image), `submitPage` (body +
  form link + blurb). Edited in the Studio. `content/site.ts` holds the same copy
  as a per-field fallback via `lib/site-content.ts`, so nothing renders blank
  before the singletons are seeded/edited.

## Routes

All product routes live in the `app/(site)/` group so that group's layout can own
`globals.css` — keeping the site's CSS reset off the embedded Studio (a bare
`svg { max-width: 100% }` was collapsing Sanity's icons).

- `/` — the feed (all reviews, newest first, full text)
- `/archive` — search (a compact index: plain body text + thumbnails)
- `/reviews/[slug]` — one review, its own permalink (fetches only its document)
- `/about`, `/submit` — Sanity-driven copy
- `/studio` — the embedded Sanity Studio
- `/api/revalidate` — the on-demand revalidation webhook (POST only)

## Rendering & caching

Pages are static (SSG) and refresh via ISR (60s) plus an on-demand webhook. A
Sanity webhook `POST`s `/api/revalidate?secret=…` on publish and flushes the
`reviews` and `copy` cache tags, so edits appear within seconds. `useCdn: true`
on the read client; the CDN may lag a publish by a second or two, which the tag
flush covers.

Data fetching is scoped per surface — the feed pulls full reviews, a review page
pulls one document, `generateStaticParams` pulls slugs only, and the archive
pulls a `pt::text()`-flattened index. Nothing fetches the whole dataset to render
one thing.

## Images

Review images come from Sanity's CDN and must stay allowlisted in
`next.config.mjs` (`cdn.sanity.io`) or `next/image` throws. Each surface requests
an appropriately-sized URL (feed vs. archive thumbnail vs. the review marquee).
Hovering an archive row prefetches the review's exact hero variant.

## The two Sanity projects (operational landmine)

There are **two** Sanity projects, and confusing them wastes hours:

| Project | Role | Access |
|---|---|---|
| `bnbcebcv` | **production** | Provisioned by the Vercel ↔ Sanity integration. Reach it via the Vercel dashboard → Integrations → Sanity → Open (SSO). A direct sanity.io login mints a *different*, empty user. |
| `6vag9i62` | **development** | Owned/admined directly (GitHub login). Local `.env.local` points here. |

Production runtime env is injected by the Vercel integration. Local dev reads the
public development dataset with no token; the write token in `.env.local` is only
for the seed script. Never point local writes at `production` by accident.

## Pitches

`/submit` links out to the editor's Airtable form (`SUBMIT_FORM_URL` in
`content/site.ts`). The app makes **no** Airtable API calls — the old write
endpoint was removed.
