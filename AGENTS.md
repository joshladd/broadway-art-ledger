# AGENTS.md

Guidance for AI agents (and humans) working in this repo. Read this before
making changes. `README.md` is the getting-started guide; `docs/ARCHITECTURE.md`
and `docs/DECISIONS.md` go deeper.

## What this is

**The Broadway Art Ledger** — an art-criticism publication for the New York
metro area. Next.js 16 (App Router) + React 19 + TypeScript, content in Sanity,
deployed on Vercel. Small, focused, editorial. Not a platform.

## Architecture in one screen

- **Content is in Sanity**: one document per review, plus three editable-copy
  singletons (`siteSettings` tagline, `aboutPage`, `submitPage`).
- **Two read seams are the *only* code that touches Sanity**: `lib/reviews-source.ts`
  (reviews) and `lib/site-content.ts` (copy). Everything else receives plain
  view-models.
- **Mapping is pure and unit-tested**: `lib/map-review.ts`, `lib/copy-blocks.ts`,
  `lib/about-image.ts` — no network, no client, just data → data.
- **Pages** live in the `app/(site)/` route group; the Sanity **Studio** is
  embedded at `/studio`.
- **Pitches** are a link out to the editor's Airtable form — the app makes **no
  Airtable API calls**.

See `docs/ARCHITECTURE.md` for the full map, including the two Sanity projects.

## Principles to keep enforcing

These are load-bearing. Breaking one tends to break the project's coherence, so
uphold them and push back if a request would violate one.

1. **Only the editor's copy reaches the surface.** The app renders only what
   Bryan explicitly asked for. Don't add speculative features ("what if we added
   a byline?") to the UI or a TODO doc — raise them with the human, and build
   only once he calls them in.
2. **The content model is the contract.** `content/review.ts` defines the shape;
   Sanity conforms to it, not the reverse. Change the type first, deliberately.
3. **Keep the fetch behind the seams.** Only `reviews-source` / `site-content`
   call the Sanity client. Pages and components take plain props. Mapping stays
   pure so it can be tested without a dataset.
4. **Fetch only what a surface needs.** A review page fetches its own document
   (`REVIEW_BY_SLUG_QUERY`), `generateStaticParams` fetches slugs only, and the
   archive fetches a compact index (`pt::text()` + thumbnails). Never pull the
   whole dataset to render one thing.
5. **`content/site.ts` is the fallback for the copy singletons.** The
   `copy-blocks.ts` builders are the single source of the default copy — both
   the seed and the runtime fallback use them, so seeded and unseeded render
   identically. Keep them in sync.
6. **Sanitize every CMS-provided href** through `lib/safe-href`. React does not
   sanitize `href`; a `javascript:` value would otherwise execute.
7. **The `(site)` route group owns `globals.css`.** That's why the site's CSS
   reset never reaches the embedded Studio (bare `svg { max-width }` was
   collapsing Sanity's icons). Do **not** move `globals.css` to the root layout.
8. **Fonts: any face that renders CMS content needs its real italic cut.**
   Fraunces renders body/Submit headings and Newsreader renders body prose — an
   editor italicizing text there must get a real italic, not a synthesized
   oblique. Don't drop an italic to save bytes without checking what renders it.
9. **Mind the server/client boundary.** Keep interactivity in dedicated
   `"use client"` files that receive props. A `"use client"` module's default
   export becomes a *client reference* when imported by a server module — its
   fields read back `undefined`. This bit us before; don't reintroduce it.
10. **Verify by driving the real app.** Confirm behavior — rendering, perf,
    prefetch, image sizing — against a production build in a browser (Playwright
    works well here), not just types and unit tests.

## Commands

```bash
npm run dev         # local dev (reads the Sanity development dataset)
npm run build       # production build
npm run start       # serve the production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # node --test over lib/**/*.test.ts
# seed the editable copy into the current dataset (reviews are added in the Studio):
node --env-file=.env.local --import tsx scripts/sanity-seed-copy.mts
```

## Before you call work done

`typecheck`, `lint`, `test`, and `build` all green. For anything with a runtime
surface, also drive it in a browser and confirm the actual behavior.

## Gotchas

- **Two Sanity projects** — `bnbcebcv` (production) and `6vag9i62` (development).
  This is a real landmine; read the section in `docs/ARCHITECTURE.md`.
- **Images** must stay allowlisted in `next.config.mjs` (`cdn.sanity.io`) or
  `next/image` throws "Invalid src prop" and the feed renders nothing.
- **Revalidation**: a Sanity webhook `POST`s `/api/revalidate?secret=…` on
  publish and flushes the `reviews` + `copy` cache tags. The route is POST-only.
- **No Airtable API.** The old `/api/pitch` write endpoint was removed; `/submit`
  links out to Airtable.

## Deferred / intentionally not done

- **Content-Security-Policy** — the strongest XSS header, deliberately not added
  yet because a wrong CSP breaks the site silently and the embedded Studio makes
  it fiddly. The plan (report-only first, nonce middleware, a Studio carve-out)
  is in `docs/DECISIONS.md`.
