# Decisions

Why the codebase is the way it is. These are deliberate; don't undo them without
a reason.

## Content lives in Sanity; `content/site.ts` is a fallback

Reviews and editable copy live in Sanity so the editor can publish without a
deploy. `content/site.ts` mirrors the copy as a per-field fallback, and
`lib/copy-blocks.ts` is the single source of that default copy — both the seed
script and the runtime fallback build from it, so seeded and unseeded render
identically. A fresh clone with an empty dataset still looks correct.

## The `app/(site)/` route group owns `globals.css`

The site and the embedded Studio share one document. When the site's reset was
global, bare selectors (`svg { max-width: 100% }`, `button { font: inherit }`)
leaked into the Studio and broke its chrome (icons collapsed to ~9px wide).
Scoping `globals.css` to the `(site)` group's layout — not the root layout —
keeps it off `/studio`. Verified with a browser: Studio icons went from 9px back
to 21px square.

## Fetch only what a surface needs

Earlier the review page, static params, and archive all fetched the whole
dataset. Now: a review page fetches its own document, `generateStaticParams`
fetches slugs only, and the archive fetches a compact `pt::text()` + thumbnail
index. This keeps per-page cost O(1) and stops shipping every review's Portable
Text and full-size images to the client.

## CMS hrefs are scheme-checked (`lib/safe-href`)

React doesn't sanitize `href`, so a Sanity-authored `javascript:` link would
execute. Every CMS-provided href (Portable Text links, `showUrl`, `formUrl`)
passes through `safeHref`, which allows only http(s)/mailto/relative.

## Fonts load the italic cuts that CMS content needs

Fraunces renders body/Submit headings and Newsreader renders body prose; an
editor italicizing text there must get a real italic, not a browser-synthesized
oblique. So both keep their italic cut even though no static style requests it.
Bold needs no separate cut — both are variable fonts. Unused faces (Archivo) and
weights (Space Mono 700) were dropped.

## No Airtable API

The prototype had a design-exploration surface (multiple themes at `/designs`,
`/lab`, `/t`) and an unauthenticated `/api/pitch` endpoint that wrote to Airtable
to serve those prototype forms. All of it was deleted once the Sanity site became
the final design. `/submit` links out to the editor's Airtable form; the app
makes no Airtable API calls.

## Scaling for a large review count

The publication expects a large number of reviews over time. Two surfaces are
O(N) in review count and are being moved to bounded patterns. Measured against a
500-review dev seed: the feed query is ~1.4 MB (~2.8 KB/review) and the archive
index ~1 MB (~2.2 KB/review), both linear — roughly ~12 MB and ~9 MB at 4,500.

- **Feed (`/`)** — keep the full-text reading experience, but paginate: server-
  render the newest ~15, then infinite-scroll the rest from a paginated GROQ
  slice (`| order(publishedAt desc) [start...end]`). Bounds payload and DOM.
- **Archive (`/archive`)** — server-side search (GROQ `match`, scored) instead of
  shipping the whole corpus to the client for Fuse; the no-query browse list is a
  virtualized/windowed list of compact rows over a paginated index.
- **Build** — cap `generateStaticParams` to the recent N and enable on-demand ISR
  (`dynamicParams`) for older reviews, so the build never prerenders thousands of
  pages.

Review pages (`/reviews/[slug]`) are O(1) and need no change.

## Security posture

Shipped: baseline headers (HSTS, `X-Frame-Options`, `nosniff`, Referrer-Policy,
Permissions-Policy); the revalidate route is POST-only with a constant-time
secret compare; CMS href sanitization (above). The revalidation secret was
rotated across Vercel + both Sanity webhooks after it appeared in a log line.

### Deferred: Content-Security-Policy

CSP is the strongest XSS header and is **not** yet added — deliberately, because
a wrong CSP breaks the site silently at runtime and the embedded Studio makes it
fiddly. The plan when it's done:

1. Add middleware that generates a **per-request nonce** and stamps it on Next's
   inline scripts (`script-src 'nonce-…'`) — not `'unsafe-inline'`, which would
   defeat the point.
2. Author the policy: `self` + `cdn.sanity.io` (images/fonts) + `*.sanity.io`
   (the Studio's API/websocket `connect-src`) + the nonce for scripts.
3. Give `/studio` a **relaxed variant** — it needs inline styles, dynamic
   evaluation, blob URLs, and websockets a strict site policy would block.
4. Ship it in **`Content-Security-Policy-Report-Only`** first, drive every route
   (including the Studio) in a browser to collect violations, widen until clean,
   then flip to enforcing.

Do it on its own branch behind report-only. It's a hardening layer, not a hole —
the concrete XSS vector (`javascript:` hrefs) is already closed.
