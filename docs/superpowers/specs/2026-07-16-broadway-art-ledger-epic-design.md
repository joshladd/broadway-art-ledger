# The Broadway Art Ledger — Master Spec (Epic)

- **Date:** 2026-07-16
- **Status:** **Built 2026-07-17. All phases complete.** Reviews render from Sanity
  end-to-end against 8 seeded reviews. One decision is open: which Sanity project is
  canonical (see §12).
- **Owner:** Josh (build), Bryan (editorial/design sign-off)

This is the single master spec for the whole epic. It is intentionally
comprehensive and phased. Each phase can spin off its own implementation plan
(via the writing-plans skill) at build time, but the design decisions,
architecture, and the content contract live here.

**This spec has been grilled** (2026-07-16). Every decision needed to build is
resolved and recorded in §11; §12 lists only what is deferred or blocked on
Bryan. Findings verified against the live codebase, the Sanity project, and
Bryan's Airtable are marked as such.

---

## 1. Summary

The Broadway Art Ledger is an art-criticism publication for the New York
metropolitan area — short (200–400 word) reviews, one marquee image each, an
anonymous blind-pitch intake, and writers paid a flat $200 on publication.

This epic takes the project from its current state (an 8-variant design
exploration reading reviews from an Airtable "Reviews" table) to a **finished,
single-identity site**:

- **One finalized design** at `/` — Bryan's chosen direction: **Kunsthalle's
  layout, recolored to Broadside's warm-paper + ink-blue palette**, plus his
  eight specific tweaks.
- **Reviews sourced from Sanity CMS** — Bryan pastes finished reviews into a
  Studio embedded at `/studio`. Airtable stops being the review store, and the
  app ends up with **no Airtable dependency at all**.
- **`/submit` = Bryan's copy + a link to his existing Airtable form.** Our own
  on-site form is deferred (blocked on his `aiText` email field). We do not
  modify his base.
- **The design exploration moves to `/designs`**; `/` becomes the real site.
- Deployed on **Vercel**, with Sanity connected via the Vercel Marketplace
  integration.

---

## 2. Goals & non-goals

**Goals**
- Ship a single, distinctive, finished visual identity Bryan has already signed
  off on in direction.
- Cleanly separate the two data planes: **read reviews from Sanity**, **write
  pitches to Airtable**.
- Make Bryan's content workflow real: pitch → Airtable → (his direct editorial
  handoff, off-platform) → paste finished review into Sanity → live on site.
- Keep the exploration work intact and browsable at `/designs`.
- Prove the Sanity content contract with seeded content before wiring the UI to
  it.

**Non-goals (for this epic)**
- Renaming Reviews → **Current** (Bryan's future step; the *Archive itself ships
  now* — only the "Current" label is deferred).
- **Individual review pages / permalinks.** The site has exactly four surfaces:
  Reviews, Archive, About, Submit. Reviews are read in the feed or expanded
  inline in the Archive — never on their own page.
- Any editing UI beyond Sanity Studio itself.
- Modifying Bryan's Airtable base schema (we adapt to it; the one exception is
  the `aiText` email-field snag — see §8, and it's *his* change to make, not a
  structural change we impose).
- Multi-author accounts, payments automation, newsletters.

---

## 3. Architecture at a glance

Two independent data planes meet in the Next.js app on Vercel.

```
                       ┌─────────────────────────────────────────┐
   READ  (reviews)     │            Next.js on Vercel            │     WRITE (pitches)
                       │                                         │
  Sanity project ──────▶  GROQ fetch (next-sanity, ISR/tags)     │
   • review docs       │  Portable Text render (italic + link)   │
   • hero images ──────▶  @sanity/image-url (CDN, natural aspect) │
   • Studio at /studio │                                         │
        │              │  /   /archive   /about   /submit        │
        │ publish       │  /designs (+ /t/[theme]) = exploration  │
        ▼              │                                         │
  Sanity webhook ──────▶  /api/revalidate (revalidateTag)        │
                       │                                         │
                       │  /submit form ──▶ /api/pitch ───────────┼────▶ Airtable
                       │                                         │      "Pitch Submissions"
                       └─────────────────────────────────────────┘      (appi8Pjrcq4G6Lz8p)
```

- **Reviews** are read from Sanity at build/ISR time and revalidated on publish
  via a Sanity webhook hitting our existing `/api/revalidate`.
- **Pitches** are written from our own form to Bryan's Airtable base. Airtable is
  now *write-only* from the app's perspective (intake), and the app never reads
  reviews from Airtable again.
- The old `/api/photo` Airtable image proxy becomes obsolete for reviews (images
  now come from Sanity's CDN). It can be removed once the Airtable review path is
  gone.

---

## 4. The content model (the foundation)

The `Review` shape is the contract between Sanity (produces it) and the theme
(renders it). Locking it first lets the design build on mock data while Sanity is
still being set up.

**Proposed `Review` (rendering contract):**

| Field | Type | Notes |
|---|---|---|
| `slug` | string | stable identity key — used for React keys, archive rows, and Sanity doc identity. **Not** a URL (no review pages). |
| `headline` | string | the review's own editorial title — big, bold. Distinct from `showName` (seed confirms, e.g. "The Face in the Glass"). Rendered one step smaller per Bryan. |
| `showName` | string | **single free-text** dateline label — whatever Bryan types (usually the gallery/institution, sometimes an artist-show label). No gallery/artist/neighborhood sub-structure. |
| `startDate` | ISO date | show run start |
| `endDate` | ISO date | show run end |
| `showUrl` | url | link target for the dateline (may be empty → dateline renders unlinked) |
| `body` | Portable Text | Sanity **default block content** (standard styles/marks/lists) + a link annotation; rendered with `@portabletext/react`. Bryan's "just italic + link" was about a hypothetical hand-rolled CMS — with Sanity we take its defaults. |
| `heroImage` | object | `{ asset, alt, caption }` — one marquee image; `caption` is writer-provided and **aligns to the image**; `alt` is a11y-only (not visible copy) |
| `tagline` | string? | optional teaser — **renders if and only if non-empty**. Blank (the default, and Bryan's stated preference) → nothing renders. He opts in per-review by typing one; no toggle, no deploy, no dead code. |
| `publishedAt` | ISO datetime | ordering key; newest first ("most recent at top") |

**Not on the app surface (parked in `docs/IDEAS.md`):** writer **byline** and a
separate photo **credit** line. Bryan did not call these out. The rendered app
carries only fields he explicitly requested; ideas graduate to the surface only
with his sign-off.

**Dateline render:** `{showName}, {formatRange(startDate, endDate)}`, hyperlinked
to `showUrl` (Bryan's choice: link the dateline itself). Example:
`Alex Berns, May 15–June 13, 2026`.

**`formatRange` rule — resolved: CMOS** (Bryan's guidelines state "We follow
CMOS"). En dash (`–`), no surrounding spaces:

| Case | Render |
|---|---|
| Same year (his example) | `May 15–June 13, 2026` |
| Same month **and** year | `May 15–27, 2026` (CMOS collapses the repeated month) |
| Spanning years | `December 10, 2025–January 20, 2026` |

**Changed from the current model:**
- **Dropped:** `no` (№ — no issue number), `date`/`iso` single date →
  `startDate`/`endDate`, `exhibition`/`venue` → single free-text `showName` +
  dates + `showUrl`, `artist`/`artwork`/`credit` → gone (caption covers it),
  `by`/byline → parked in `docs/IDEAS.md`, `dek` → renamed `tagline`, plain-string
  `body` → Portable Text.
- **Added:** `showUrl`, `startDate`, `endDate`, `heroImage.caption`,
  `publishedAt`.

---

## 5. Phases

Each phase is independently shippable. Order chosen so Bryan sees the finished
design fast (Phase 1 runs on mock data), with Sanity and the form following.

### Phase 0 — Content model + **freezing the exploration**
- Define the new model (§4) in a **new module** the real site imports. Do **not**
  modify `content/reviews.ts`'s existing `Review` type.
- **Freeze `/designs` on the legacy type + static seed** (decision — see below).
- Add a small **mock fixture** on the new model (3–4 entries) so the finalized
  design renders before Sanity is wired.
- **Done when:** the new type compiles, the fixture drives a page, and the whole
  exploration still builds untouched.

#### Why the freeze (load-bearing)
Measured 2026-07-16: **38 files** reference fields the new model drops
(`no`/`exhibition`/`venue`/`by`/`dek`/`artist`/`artwork`/`credit`) and **19**
consume `body` as `string[]`, which Portable Text breaks. All of them are
exploration: 9 themes, 7 lab designs, the shared archive. Under TS strict, editing
the shared `Review` type **fails the build across the entire exploration** and
holds Bryan's finalized design hostage to rewriting 38 files of frozen reference
art.

**The freeze:**
- `content/reviews.ts` — its `Review` type and its **vestigial static `reviews[]`
  seed** (currently dead migration residue) stay exactly as they are and become
  the exploration's data source.
- Exploration routes **stop calling `getReviews()`** → `/designs` touches neither
  Sanity nor Airtable. It becomes **fully static**, which is correct for frozen
  reference art.
- Consequence: **no future change to the live model can ever break `/designs`.**
- Accepted cost: two `Review` types coexist. Honest — they are different things:
  frozen exploration data vs. a live content contract.

### Phase 1 — Finalized design at first-class routes; exploration → `/designs`
- Build the finalized theme (§6): Kunsthalle layout + Broadside palette + the 8
  tweaks; feed = full essays inline (newest first); dateline linked.
- Promote the real site to **first-class routes** — exactly four surfaces:
  **`/` (Reviews feed), `/archive`, `/about`, `/submit`**. No `/reviews/[slug]`
  (resolved: no individual review pages).
- **Archive** carries over Folio's proven pattern (`themes/folio/archive-list.tsx`):
  compact ruled index + **fuzzy search (fuse.js)** + **inline accordion expand**
  (CSS grid-rows 0fr→1fr) to read the full review in place. Search is the
  archive's *reason to exist* — find a review without the raw scroll.
- Fuse keys must be re-mapped to the new model (old keys reference dropped
  fields): `headline`, `showName`, `tagline`, `bodyText`.
- Move the current exploration homepage (`app/page.tsx`: 8 themes + Lab) to
  **`/designs`**; keep individual previews at `/t/[theme]` (linked from
  `/designs`).
- Runs entirely on the Phase 0 mock fixture.
- **Done when:** `/` shows the finalized feed; `/designs` shows the exploration;
  Bryan can review the real look.

### Phase 2 — Sanity as the review source
- Install the **Vercel ↔ Sanity** integration (provisioning + env vars +
  billing); scaffold `next-sanity`.
- Author the Sanity **`review` schema** to match §4; embed **Studio at
  `/studio`**.
- **Seed the 8 existing fake CC0 reviews into `development`** via a script using
  `SANITY_API_WRITE_TOKEN` (no hand-typing). Porting them requires **fabricating**
  `startDate`/`endDate`/`showUrl` (the old model has only a single date) and
  folding `artist`/`artwork`/`credit` into `heroImage.caption`. This is dev-only
  data and never touches `production`.
- Uploading the 8 `public/art/*.jpg` originals as Sanity image assets is part of
  the seed script (proves the image pipeline end-to-end).
- Add the Sanity client + typed **GROQ** query; render `body` via Portable Text;
  serve `heroImage` via `@sanity/image-url` (natural aspect via asset metadata).
- Replace `lib/reviews-data.ts` (Airtable read) with the Sanity read; tag the
  fetch and wire a **Sanity webhook → `/api/revalidate`** for publish-time
  updates.
- **Done when:** `/` and `/archive` render from Sanity; publishing in
  Studio updates the live site within the revalidation window.

### Phase 3 — Submit page: **Bryan's copy + a link to his Airtable form**
**Resolved:** this epic does **not** build our own form. `/submit` = Bryan's
"Anonymous Pitch Guide" + Review Guidelines copy, plus an outbound **link to his
existing Airtable submission form**.

- His form view is confirmed: **"The Broadway Art Ledger Submission"**
  (`viwp8fcRdPjTirQkF`) on `Table 1` / `appi8Pjrcq4G6Lz8p`.
- **Share URL:** `https://airtable.com/appi8Pjrcq4G6Lz8p/shrEAVG242D5A34Hk`
  (public share link — not a secret; safe to commit. Store as a constant, not an
  env var.)
- Link opens in a **new tab** (`target="_blank" rel="noopener noreferrer"`) — it's
  an outbound handoff to another product; no dead end for the writer.
- ✅ **Verified public** (2026-07-16): the link renders the form for a logged-out
  visitor in an incognito window. (An unauthenticated GET returns HTTP 200 but the
  form is client-rendered, so this could only be confirmed in a browser.)
- No `/api/pitch` changes, no attachment mechanics, no `aiText` dependency.
  Writers can submit **today**, through the form Bryan already built.
- **Done when:** `/submit` shows his copy and links out to his working form.

#### Deferred: our own on-site form (a later epic)
Blocked on Bryan converting `Writer Email` from `aiText` to a plain text field
(§8). **Do not** work around it by folding the email into the `Pitches` body — his
guidelines forbid identifying information inside the pitch ("This will
automatically disqualify you"), and his separate **`Pitch View`** grid exists
precisely so he can read pitches blind. The workaround would defeat the blind
review; waiting is correct.

### Phase 4 — Copy + About image
- Replace placeholder copy with Bryan's real materials (§9): tagline, About
  statement, Submit guidelines, footer facts/motto.
- **Extract the About image** embedded as base64 in `The Broadway Art Ledger.md`
  to a real asset (`public/…`) and place it atop the About page (Bryan
  explicitly wants that image there).
- **Done when:** About and Submit read Bryan's final copy; the About image
  renders.

### Phase 5 — Cutover + domain
- Final routing cutover: `/` = finalized site; `/designs` = exploration; remove
  the dead Airtable review path + `/api/photo` (reviews).
- **Domain + email** setup (deferred — §12) — Bryan buys the domain; decide
  whether/how to run email at it.
- **Done when:** the site is live on the domain, reading Sanity, writing
  Airtable, exploration preserved at `/designs`.

---

## 6. Finalized design (the theme)

**Direction:** Kunsthalle's structure, recolored to Broadside's palette. Museum-
wall restraint; the art carries the color; ink-blue is the only chromatic accent
in the chrome.

**Palette (from Broadside):**
- `--bg` warm paper `#f2efe6`
- `--ink` `#1b1a16`  ·  `--ink2` `#6a675c`
- `--rule` `#d5d0c1` (hairlines)  ·  `--blue` ink-blue `#1e3a8a` (accent: active
  nav, dateline link, hairline emphasis)

Resolved (not a question): use **Broadside's palette values verbatim**. Bryan
asked for "the color of 3" — that is 3's palette, not our reinterpretation of it.

**Type (from Kunsthalle):** Newsreader body serif; Fraunces display for the
wordmark/headlines; mono for labels/nav/meta. Title size steps **down** one notch
per Bryan.

**Layout — homepage feed (`/`):** single centered reading column (~1000px max).
Newest review at top. Each review renders **in full** (200–400 words → whole essay
inline), stacked as a continuous museum-wall scroll:

```
——————————— THE BROADWAY ART LEDGER ———————————
      Incisive criticism and equitable publishing…
         Reviews · Archive · About · Submit
———————————————————————————————————————————————

        [    full-width marquee image    ]
        caption, aligned to image edges · credit

        Headline of the Review              ← Fraunces, one step smaller
        Alex Berns, May 15–June 13, 2026    ← dateline, linked (ink-blue)
        By A. Writer

        Full 200–400 word essay in the column,
        italic and links live inside the prose…

———————————————————————————————————————————————
        (next review, same pattern, below)
```

**Archive (`/archive`):** the *finding* surface, in the same palette/type. A
compact ruled index (thumbnail · date · showName · headline) over a **fuzzy
search** field; clicking a row **expands the full review inline** (accordion) —
this is how reviews stay readable with no permalink pages. Reviews (`/`) is the
*reading* surface (raw scroll); Archive is the *retrieval* surface.

**No review permalinks.** `ReviewPage` in the theme registry stays an
exploration-only concern (note: it is already dead code — `reviewHref()` points
at a `/t/<theme>/r/<slug>` route that has never existed).

**The eight tweaks (Bryan), applied:**
1. No № anywhere.
2. **Review headline** one step smaller — *not* the masthead. Resolved by
   evidence: Kunsthalle's site wordmark is already `20px` (nobody calls that
   "slightly smaller"), while the review headline `.title` is
   `clamp(38px, 5.2vw, 66px)`. Step it down roughly to
   `clamp(34px, 4.6vw, 56px)`; the wordmark is untouched.
3. No tagline by default (optional field retained).
4. Dateline = `showName, date-range`, **hyperlinked** to the show.
5. Nav = **Reviews · Archive · About · Submit** (only the "Current" *rename* is deferred; Archive ships now).
6. Newest review always first.
7. About & Submit kept clean/minimal (Bryan's copy, §9).
8. **Captions align with images** — caption block shares the image's width and
   left edge.

**Nav / wordmark:** horizontal header — "The Broadway Art Ledger" **text
wordmark** left, `Reviews · Archive · About · Submit` right, tagline strap beneath
a hairline.

**No Mark, no invented branding.** The two-squares Mark is **cut** (parked in
`docs/IDEAS.md`): Bryan never called it out, Kunsthalle is wordmark-only, and
vermilion would fight the ink-blue accent. **Rule for this build: the surface
carries only what Bryan explicitly asked for — no branding, chrome, or copy we
invented.**

**Boundary of that rule — functional microcopy is ours** (approved): UI strings
Bryan will never write are fine, kept plain and neutral, never in a publication
"voice." Covers: search placeholder, no-results text, empty states, form labels,
button text, success/error messages. The test — *would Bryan recognize this as
writing, or as a button?* Editorial voice and branding remain strictly his.

**Empty states** (needed — Kunsthalle has **no** empty guard today, and
`production` ships with zero reviews):
- Day-one feed with no reviews → renders chrome and nothing else. No invented
  "coming soon." Transient; resolves on his first publish.
- Archive **no-search-results** → neutral microcopy (this is a permanent,
  normal-use state, not transient).

**Footer: none.** No footer at all — not even a colophon. Bryan never called one
out. The facts strip was our paraphrase; the motto stays where he actually wrote
it (the closing line of the About statement); his contact email lives on Submit,
where he put it. Pages simply end.

**Quality floor:** responsive to mobile (mobile hero/text placement — carry the
Folio mobile fix), visible keyboard focus, `prefers-reduced-motion` respected,
next/image natural aspect.

---

## 7. Sanity (reviews)

**Setup: DONE — verified 2026-07-16.** The Vercel Marketplace integration is
already installed and has provisioned the project. Confirmed by probe:

- Project **`bnbcebcv`**, dataset **`production`** (the only dataset → no
  prod/dev split question).
- `.env.local` carries `NEXT_PUBLIC_SANITY_PROJECT_ID`,
  `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_READ_TOKEN`, **and
  `SANITY_API_WRITE_TOKEN`** (plus non-public duplicates). Properly gitignored
  (`.gitignore:24 → .env*.local`).
- Project is **empty**: 12 documents, all system types (`system.group`,
  `system.retention`). No schema, no content yet.

**Consequence:** the **write token means seeding is scriptable** — Phase 2's
"prove the contract" step is a seed script, not hand-typing into Studio.

**Packages:** `next-sanity` (client + `defineQuery` GROQ + Studio),
`@portabletext/react` (body), `@sanity/image-url` (images).

**Schema — `review` document:**
- `headline` (string, required)
- `slug` (slug, from headline)
- `showName` (string, required)
- `startDate` (date), `endDate` (date)
- `showUrl` (url)
- `writer` (string)
- `heroImage` (image with `hotspot`; fields: `alt`, `caption`, `credit`)
- `body` (Portable Text — Sanity **default block content**: standard styles,
  marks, and lists, plus a link annotation. No hand-restriction.)
- `tagline` (text, optional — not rendered by default)
- `publishedAt` (datetime)

Resolved: use Sanity's **default** block content (standard styles/marks/lists +
link). "Just italic + link" was Bryan's take on a hand-rolled CMS; Sanity's
defaults are free and fine.

**Studio:** embedded at `/app/studio/[[...tool]]` so Bryan edits at
`site.com/studio` with no separate app.

**Read path:** typed GROQ query sorted `publishedAt desc`; `next: { revalidate,
tags: ["reviews"] }`. `getReviews()` in `lib/reviews-data.ts` is rewritten to
call Sanity and map documents → the §4 `Review` shape. Image URLs built with
`@sanity/image-url` at the sizes the theme requests; natural aspect from asset
`metadata.dimensions`; LQIP available for blur-up.

**Revalidation:** Sanity **webhook** on publish → `POST /api/revalidate`
(existing endpoint: `updateTag` + `revalidatePath("/", "layout")`, guarded by
`REVALIDATE_SECRET`).

⚠️ **`/api/revalidate` is dead code today — verified 2026-07-16.** It requires
`REVALIDATE_SECRET`, which is set **nowhere** (absent from `.env.local`); the
endpoint currently returns `"REVALIDATE_SECRET is not configured"` and bails.
Phase 2 must: generate the secret, add it to `.env.local` **and** Vercel, then
point the Sanity webhook at the endpoint with it. Without this, Bryan publishes
and nothing happens until the ISR window lapses.

**Datasets — two, and the free tier allows exactly two:**
- **`production`** — Bryan's real reviews. Serves 100% of the live site (reviews
  are the only content type, so one dataset covers production entirely).
- **`development`** — created by us; holds the **seeded 8 fake CC0 reviews** and
  any contract-proving work.

Rationale: the seed content is fabricated (invented run-dates and show URLs on
fake reviews of real museums). It must never be one env var away from the live
site. The app already reads `NEXT_PUBLIC_SANITY_DATASET`, so switching between
them is a single variable. `production` stays pristine from day one — we never
purge-before-launch, because nothing fake ever enters it.

---

## 8. Airtable (pitches)

**Base (confirmed via read-only Metadata API — we do not modify it):**
- Base: **Pitch Submissions** `appi8Pjrcq4G6Lz8p` (PAT permission: edit)
- Table: **Table 1** `tblGN5gyU7s3CDcTF`
  - `Pitches` — multilineText
  - `Writer Name` — singleLineText
  - `Attachments` — multipleAttachments
  - `Writer Email` — **aiText** ⚠️
  - `Status` — singleSelect [Denied, Maybe, Approved]

**Views (read-only probe):** `Master View` (grid), **`Pitch View`** (grid — almost
certainly his blind-review view with identity columns hidden), and **"The Broadway
Art Ledger Submission"** (**form**, `viwp8fcRdPjTirQkF`).

**This epic writes nothing to Airtable.** `/submit` links out to Bryan's own form
(Phase 3). The app has **no Airtable dependency at all** once the Reviews read
moves to Sanity — the PAT is then unused by the running app.

### Deferred: our own on-site form
When we build it, the mapping is:
- Writer Name → `Writer Name`
- Pitch → `Pitches` (guidelines tell writers to include a **proposed filing date**
  and their **photo caption** here)
- Attachment(s) → `Attachments`
- Email → `Writer Email` **← blocked**
- `Status` left empty (Bryan triages)

**The `aiText` blocker:** `Writer Email` is an AI-computed field; the API cannot
write user input into it. **Bryan must convert it to a plain text/email field.**

**Do not work around it** by folding the email into `Pitches`. His guidelines
forbid identifying information inside the pitch ("This will automatically
disqualify you from consideration"), and the existence of a separate `Pitch View`
shows the blind read is a real part of his process. The workaround would put
identity directly in his eye-line while judging. Waiting is correct.

**Attachments (when we build it):** Airtable attachment fields take a **public
URL**, not raw multipart — so we'd need an upload step (Vercel Blob → URL) or
Airtable's upload-attachment endpoint. Note his guidelines require the photo for
the *review*, not necessarily at *pitch* time. Unresolved until that epic.

**Security:** PAT stays in gitignored `.env.local`, read via `process.env`, never
echoed or committed.

---

## 9. Copy & assets (Bryan's real materials)

Source files in repo: `The Broadway Art Ledger.md` (About + tagline + embedded
image), `Submission Instructions.md` (Submit guide + guidelines).

- **Tagline / strap:** "Incisive criticism and equitable publishing in the New
  York Metropolitan area."
- **About page:** Bryan's `image1` atop the four-paragraph About/Submissions
  statement (ending "…Because King Kong died here, and it's where the best art
  lives."). **Verified:** the blob is a real **PNG, ~205 KB**, embedded as a
  base64 data-URI reference-link (`[image1]: <data:image/png;base64,…>`) at the
  end of `The Broadway Art Ledger.md` → decode and write to `public/`. He
  explicitly asked for this image on the About page.
- **Submit page:** "Anonymous Pitch Guide" intro + the 10-bullet Review
  Guidelines + contact `thebroadwayartledger@gmail.com`. Note the guidelines ask
  writers to include a proposed filing date and to supply their own caption — both
  live in the pitch text (keeps the form to four fields).
- **Footer:** facts (blind/anonymous pitches; one marquee image; $200 flat fee) +
  motto + colophon.
**Resolved: Bryan's md is the source of truth, used verbatim.** The rule is
"only keep copy from him" — the existing placeholder About/Submit prose was our
paraphrase and is replaced wholesale.

---

## 10. Testing plan

- **Content model / rendering:** the Phase 0 fixture and the Phase 2 Sanity seed
  render identically → proves the contract holds across data sources.
- **Design:** manual review by Bryan on `/` (feed) and `/archive`; responsive
  check at mobile widths (carry the Folio mobile fix); keyboard focus +
  reduced-motion pass.
- **Empty states:** point local at an empty dataset → `/` renders chrome only, no
  crash (Kunsthalle has **no** empty guard today); archive search with no match
  shows neutral microcopy.
- **Archive:** search finds by `headline`/`showName`/`tagline`/body; row expands
  and collapses; one row open at a time; expansion never fights scroll position.
- **Sanity:** publish an edit in Studio → webhook revalidates → change appears.
  Malformed doc (missing image, missing `endDate`, empty `showUrl`) degrades
  gracefully — dateline renders unlinked rather than crashing.
- **Dateline:** `formatRange` unit-checked against all three CMOS cases
  (same-year, same-month, cross-year).
- **Exploration freeze:** `/designs` + all 9 themes + 7 lab designs still build
  and render after the new model lands — the whole point of the freeze.
- **Routing:** `/`, `/archive`, `/about`, `/submit` are the real site;
  `/designs` + `/designs/archive` + `/t/[theme]` serve the exploration; no
  collision on `/archive`.
- **Submit:** the outbound Airtable link opens in a new tab and renders for a
  logged-out visitor.
- **Build:** `next build` clean (types + lint) before cutover.

---

## 11. Decision log

Every entry below is **resolved** — settled in the 2026-07-16 grill, by evidence
where noted.

**The governing rule**
- **The app surface carries only what Bryan explicitly called out.** No invented
  branding, chrome, or copy. Our ideas go to `docs/IDEAS.md` and graduate only
  with his sign-off.
- **Boundary:** *functional microcopy is ours* — search placeholder, no-results,
  empty states, form labels/buttons/errors — kept plain and neutral. Test: *would
  Bryan recognize this as writing, or as a button?*

**Content model**
- `headline` is **distinct** from the dateline label (seed confirms: "The Face in
  the Glass" vs "Brooklyn Museum").
- Dateline label is a **single free-text `showName`** — no gallery/artist/
  neighborhood sub-structure. Neighborhood dropped.
- **Show link: the dateline itself** is the link (no trailing "For more
  information" sentence).
- **Dates: CMOS** (he states he follows it) — collapse the repeated month.
- **Body: Sanity's default** block content — "just italic + link" described a
  hand-rolled CMS, which we aren't building.
- **`tagline` renders iff non-empty** — his per-review opt-in, no toggle, no dead
  code. Default (blank) = no teaser, as he asked.
- **Cut from the surface:** `no`/№, `venue`, `artist`, `artwork`, `credit`, and
  the **byline** → all parked in `docs/IDEAS.md`.

**Architecture**
- **Four surfaces, no permalinks:** `/` (Reviews), `/archive`, `/about`,
  `/submit`. Reviews are read in the feed or expanded inline in the Archive.
  (Note: `ReviewPage` + `reviewHref()` are already dead code — they point at a
  route that has never existed.)
- **Reviews = the raw scroll** (all, newest first). **Archive = search/find** —
  search is its *reason to exist*, so Folio's fuse.js + inline accordion carry
  over.
- **Freeze the exploration** on the legacy type + static seed. Measured: 38 files
  reference dropped fields, 19 consume `body` as `string[]`. `/designs` goes fully
  static and can never be broken by the live model again.
- **Real site on first-class routes**; the theme registry stays exploration-only.

**Design**
- **Kunsthalle layout + Broadside palette verbatim** — he asked for "the color of
  3", so we take 3's values, not a reinterpretation.
- **"Slightly smaller title" = the review headline**, not the masthead (evidence:
  wordmark is already 20px; `.title` is up to 66px).
- **No Mark. No footer at all.** Both were ours, not his.

**Sanity**
- **Vercel integration: already installed** — it provisioned project `bnbcebcv`.
  (The earlier "install it" recommendation is moot; the reversed advice to skip it
  was also moot — it was already done.)
- **Two datasets** (the free-tier max): `production` (real, serves 100% of the
  live site) and `development` (the 8 seeded fakes). Fabricated seed data never
  sits one env var from the live site.
- **Studio embedded at `/studio`**; dataset per environment via
  `NEXT_PUBLIC_SANITY_DATASET` — local can flip to `production` any time to test
  against real content, no code change.
- **Seeding is scripted** (a `SANITY_API_WRITE_TOKEN` exists), including uploading
  the 8 `public/art` images as Sanity assets.

**Submit / Airtable**
- **This epic ships `/submit` as his copy + an outbound link to his own Airtable
  form** (`shrEAVG242D5A34Hk`, verified public in incognito, opens in a new tab).
  Our own form is **deferred**.
- **The app has no Airtable dependency** once reviews come from Sanity.
- **Never fold the email into the pitch body** — it would defeat his blind review.
  Blocked until Bryan converts `Writer Email` from `aiText` to a text field.
- **Do not modify Bryan's Airtable structure.**

---

## 12. Still open

### RESOLVED: two Sanity projects, split prod/dev

Discovered 2026-07-17 while trying to create the `development` dataset — the
duplicate-project risk that was flagged before the integration was installed.

| Project | Name | Created by | Josh's access | Role |
|---|---|---|---|---|
| `bnbcebcv` | broadway-art-ledger | Vercel integration | none (401) | **PRODUCTION** |
| `6vag9i62` | BroadwayArtLedgerCMS | Josh (GitHub) | owner/admin | **DEV** |

**Decision (Josh, 2026-07-17): `bnbcebcv` is canonical for production;
`6vag9i62` is dev.** This is already the live state and needs no migration:

- **Production** — the Vercel integration injects `bnbcebcv` env vars into Vercel
  directly. Its `production` dataset is `aclMode: public`, so the deployed site
  reads it with no token. Untouched by us.
- **Dev** — `.env.local` points at `6vag9i62` / `development`, seeded with the 8
  fabricated reviews. Josh administers this project, which is why the dev dataset
  could be created at all.
- The schema is **code** (`sanity/schemas/review.ts` + `sanity.config.ts`), so the
  embedded Studio serves it against whichever project the env names. Nothing needs
  deploying per-project.
- The seed script refuses any dataset named `production`, in either project.

#### RESOLVED: Josh IS the admin of production — under his .edu identity

`bnbcebcv`'s administrator `pw8xaHgNK` is **joshua.ladd@colorado.edu** (org
`oCJNMzdPm` = "joshladd's projects"). It was never a permissions problem — the
Sanity CLI logins used `ladd6531@gmail.com`, which is a *different* Sanity user
(`gA9Goao8t`) that owns nothing.

**To administer production:** sanity.io/manage → sign in with Google as
**joshua.ladd@colorado.edu** (not the gmail). From there: invite Bryan (Members →
Invite → role `editor`), manage datasets, create the revalidation webhook.

**Studio access:** the deployed `/studio` authenticates against Sanity, so Josh
signs in with the .edu account and Bryan with whatever address he's invited under.

Identity map, so this never confuses anyone again:

| Sanity user | Email | Owns |
|---|---|---|
| `pw8xaHgNK` | joshua.ladd@colorado.edu | **`bnbcebcv` (production)** — administrator |
| `gWejjEkFi` | ladd6531@gmail.com (GitHub login) | `6vag9i62` (dev) |
| `gA9Goao8t` | ladd6531@gmail.com (Google login) | nothing |

### Blocked on Bryan (blocks nothing shipped)
- Convert `Writer Email` from `aiText` → plain text field. Gates *our own* submit
  form only; `/submit` ships as his copy + a link to his form.

### Manual, at deploy time
- Add `REVALIDATE_SECRET` (already in `.env.local`) to Vercel's env vars.
- Create the Sanity webhook → `https://<domain>/api/revalidate?secret=<secret>`,
  dataset `production`, filter `_type == "review"`.

### Deferred by decision
- **Domain** and **email at the domain**. Orientation: Cloudflare Email Routing
  (free forward → Gmail + "send as") for a single contact address; Zoho free tier;
  Fastmail ~$3–5/user/mo; Google Workspace ~$7/user/mo for real mailboxes.
- **Our own on-site pitch form** — its own epic.
- **Current/Archive rename**, **byline**, **photo credit**, **the Mark** — all in
  `docs/IDEAS.md` awaiting Bryan.

---

## 12b. Bugs found and fixed while building

- **`/api/revalidate` could never have worked.** Broken two ways: no
  `REVALIDATE_SECRET` was set anywhere, *and* it called `updateTag`, which throws
  outside a Server Action ("use revalidateTag instead"). Next 16 also requires a
  cache-life profile as `revalidateTag`'s second argument. Now fixed and verified
  (200 `{ok:true}` with the secret, 401 without).
- **Review permalinks never existed.** `reviewHref()` generated
  `/t/<theme>/r/<slug>`, a route that was never created, and every theme's
  `ReviewPage` was dead code. Resolved by decision: the site has no review pages.
- **`@sanity/image-url` v2** deprecated its default export and moved
  `SanityImageSource` to the package root; the documented
  `lib/types/types` subpath no longer exists.
- **`next/image` rejected every Sanity URL.** `cdn.sanity.io` was not in
  `next.config.mjs` `images.remotePatterns`, so each review threw "Invalid src
  prop … hostname is not configured" and the feed rendered **nothing**. Invisible
  until real Sanity URLs replaced the local `/art` fixture — and invisible to
  `curl`, because the RSC flight payload still contains the content. Only a real
  browser caught it. Lesson: grep on the flight payload is not proof of render.
- **`npm run lint` is broken** (pre-existing): it calls `next lint`, which Next 16
  removed. Not fixed — out of scope, but it means lint is not a real gate.

---

## 13. What lands where (file-level orientation)

**The real site (new, on the new model):**
- `app/page.tsx` (Reviews feed), `app/archive/page.tsx` (index + search + inline
  expand), `app/about/page.tsx`, `app/submit/page.tsx`
- the finalized theme's styles (Kunsthalle layout + Broadside palette)
- `app/studio/[[...tool]]/page.tsx`, `sanity/` (schema, client, GROQ queries)
- the new model module + `content/reviews-fixture.ts` (Phase 0 mock)
- `scripts/sanity-seed.mts` (seeds the 8 fakes + image assets into `development`)

**The exploration (frozen — legacy type + static seed):**
- **Moved:** `app/page.tsx` → `app/designs/page.tsx`; `app/archive/` →
  `app/designs/archive/` (frees `/archive` for the real site)
- **Touched only at the seams:** 8 theme `Archive` hrefs (`/archive?from=` →
  `/designs/archive?from=`), the `/t/[theme]/archive` redirect, and the
  "← All designs" back-link (which breaks anyway once `/` is the real site)
- **Data source:** the static `reviews[]` seed in `content/reviews.ts` — routes
  stop calling `getReviews()`
- **Otherwise untouched:** all 9 themes, 7 lab designs, and their `Review` type

**Rewritten:** `lib/reviews-data.ts` (Airtable read → Sanity read).

**Deferred (Bryan asleep / blocked):** `app/api/pitch/route.ts` → Pitch
Submissions base, pending his `aiText` email-field fix.

**Retired after cutover:** `app/api/photo/*` (reviews), the Airtable "Reviews"
read path.
```
