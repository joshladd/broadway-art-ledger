# The Broadway Art Ledger — Master Spec (Epic)

- **Date:** 2026-07-16
- **Status:** Draft for review → `/grill-me` → implementation
- **Owner:** Josh (build), Bryan (editorial/design sign-off)

This is the single master spec for the whole epic. It is intentionally
comprehensive and phased. Each phase can spin off its own implementation plan
(via the writing-plans skill) at build time, but the design decisions,
architecture, and the content contract live here.

Sections marked **⟢ GRILL** collect the decisions still owed by the human. They
are gathered in §12 for the `/grill-me` pass.

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
- **Reviews sourced from Sanity CMS** (lightweight — Bryan pastes finished
  reviews in; he specifically wants hyperlink + italic support). Airtable stops
  being the review store.
- **Pitches captured by our own on-site form** that writes a row into **Bryan's
  existing "Pitch Submissions" Airtable base** — we do not use Airtable's own
  form, and we do not modify his base structure.
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
- The Current/Archive nav split (future — launch nav is just **Reviews**).
- Search / fuzzy archive (Folio learning; revisit when volume warrants).
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
        │              │  /  /about  /submit  /reviews/[slug]    │
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
| `slug` | string | stable URL id (`/reviews/<slug>`) |
| `headline` | string | the review's own title — big, bold ⟢ GRILL: is this distinct from the show name, or do pieces get titled by the show? |
| `showName` | string | exhibition/institution as shown in the dateline (e.g. "Alex Berns") |
| `startDate` | ISO date | show run start |
| `endDate` | ISO date | show run end |
| `showUrl` | url | link target for the dateline (may be empty → dateline renders unlinked) |
| `writer` | string | byline ("By …") |
| `body` | Portable Text | paragraphs + **italic** + **links** (Bryan's stated needs); optional `strong` |
| `heroImage` | object | `{ asset, alt, caption, credit }` — one marquee image per review |
| `dek` | string? | optional teaser — **not rendered by default**, kept for future |
| `publishedAt` | ISO datetime | ordering key; newest first |

**Dateline render:** `{showName}, {formatRange(startDate, endDate)}`, hyperlinked
to `showUrl` (Bryan's choice: link the dateline itself). Example:
`Alex Berns, May 15–June 13, 2026`.

**`formatRange` rule:** en dash between dates; show the year once at the end when
both dates share a year (`May 15–June 13, 2026`); include both years when they
differ; drop the repeated month when start/end share one (`May 15–27, 2026`).
⟢ GRILL: confirm the exact date style (CMOS-friendly).

**Changed from the current model:**
- **Dropped:** `no` (№ — Bryan: no issue number), `date`/`iso` single date →
  replaced by `startDate`/`endDate`, `exhibition`/`venue` → replaced by
  `showName` + dates + `showUrl`, `artist`/`artwork` → folded into
  `heroImage.caption`, plain-string `body` → Portable Text.
- **Kept but demoted:** `dek` (exists as an optional field/component, off by
  default).
- **Added:** `showUrl`, `startDate`, `endDate`, `heroImage.caption`,
  `publishedAt`.

---

## 5. Phases

Each phase is independently shippable. Order chosen so Bryan sees the finished
design fast (Phase 1 runs on mock data), with Sanity and the form following.

### Phase 0 — Content model + scaffolding
- Define the new `Review` TS type (§4) and a small **mock fixture** conforming to
  it (3–4 entries) so the theme renders before Sanity exists.
- **Done when:** the type compiles and the fixture drives a page.

### Phase 1 — Finalized design at first-class routes; exploration → `/designs`
- Build the finalized theme (§6): Kunsthalle layout + Broadside palette + the 8
  tweaks; feed = full essays inline (newest first); dateline linked.
- Promote the real site to **first-class routes**: `/` (feed), `/about`,
  `/submit`, `/reviews/[slug]`. ⟢ GRILL: first-class routes vs. a `/` theme
  module — recommended: first-class (cleaner Sanity wiring + metadata; no
  `/t/[theme]` indirection for the product).
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
- **Seed** 3–4 reviews in Sanity to prove the contract (mirror the mock
  fixture).
- Add the Sanity client + typed **GROQ** query; render `body` via Portable Text;
  serve `heroImage` via `@sanity/image-url` (natural aspect via asset metadata).
- Replace `lib/reviews-data.ts` (Airtable read) with the Sanity read; tag the
  fetch and wire a **Sanity webhook → `/api/revalidate`** for publish-time
  updates.
- **Done when:** `/` and `/reviews/[slug]` render from Sanity; publishing in
  Studio updates the live site within the revalidation window.

### Phase 3 — Pitch intake (our form → Bryan's Airtable base)
- Simplify `/submit` to the four real fields (§8): Writer Name, Writer Email,
  Pitch, Attachment(s).
- Repoint `/api/pitch` at **"Pitch Submissions"** (`appi8Pjrcq4G6Lz8p`,
  `Table 1`), mapping to `Writer Name` / `Writer Email` / `Pitches` /
  `Attachments`, with `Status` left unset (Bryan triages).
- Resolve the **`aiText` email snag** (§8) — Bryan converts `Writer Email` to a
  plain text field, or we capture email inside `Pitches`.
- Handle attachment upload (Airtable attachments need a public URL or upload
  flow). ⟢ GRILL: attachment mechanics (see §8).
- **Done when:** a site submission creates a row in Bryan's base with the pitch
  and (if resolved) a working email + attachment.

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
- **Domain + email** setup (⟢ GRILL, §12) — Bryan buys the domain; decide
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
⟢ GRILL: keep Broadside blue exactly, or nudge toward a specific hue?

**Type (from Kunsthalle):** Newsreader body serif; Fraunces display for the
wordmark/headlines; mono for labels/nav/meta. Title size steps **down** one notch
per Bryan.

**Layout — homepage feed (`/`):** single centered reading column (~1000px max).
Newest review at top. Each review renders **in full** (200–400 words → whole essay
inline), stacked as a continuous museum-wall scroll:

```
——————————— THE BROADWAY ART LEDGER ———————————
      Incisive criticism and equitable publishing…
              Reviews · About · Submit
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

**Review permalink (`/reviews/[slug]`):** same typography, single review, hero
image + aligned caption, dateline link, byline, body; prev/next pager.

**The eight tweaks (Bryan), applied:**
1. No № anywhere.
2. Headline one step smaller.
3. No dek by default (optional field retained).
4. Dateline = `showName, date-range`, **hyperlinked** to the show.
5. Nav = **Reviews · About · Submit** (Current/Archive split deferred).
6. Newest review always first.
7. About & Submit kept clean/minimal (Bryan's copy, §9).
8. **Captions align with images** — caption block shares the image's width and
   left edge.

**Nav / wordmark:** horizontal header — "The Broadway Art Ledger" wordmark left,
`Reviews · About · Submit` right, tagline strap beneath a hairline. ⟢ GRILL: does
the two-squares Mark stay as an accent, or is the finalized identity wordmark-
only? (Bryan's supplied materials are wordmark-only.)

**Footer:** hairline + the three facts + motto ("…King Kong died here, and it's
where the best art lives.") + colophon. ⟢ GRILL: confirm footer keeps the facts
list, or goes more minimal.

**Quality floor:** responsive to mobile (mobile hero/text placement — carry the
Folio mobile fix), visible keyboard focus, `prefers-reduced-motion` respected,
next/image natural aspect.

---

## 7. Sanity (reviews)

**Setup:** Vercel Marketplace **Sanity integration** — one-click provisioning,
auto-injected env vars (`NEXT_PUBLIC_SANITY_PROJECT_ID`,
`NEXT_PUBLIC_SANITY_DATASET`, read token), billing via Vercel. Manual fallback:
`sanity` CLI project + hand-set env vars. Decision recorded: **install the
integration** (§11).

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
- `body` (Portable Text — **restricted marks: emphasis (italic) + link**, plus
  `strong`; block style `normal` only, no headings/lists unless requested)
- `dek` (text, optional)
- `publishedAt` (datetime)

⟢ GRILL: any block types beyond plain paragraphs (blockquote? inline image in
body)? Bryan said "just hyperlink and italicize really" → default to minimal.

**Studio:** embedded at `/app/studio/[[...tool]]` so Bryan edits at
`site.com/studio` with no separate app.

**Read path:** typed GROQ query sorted `publishedAt desc`; `next: { revalidate,
tags: ["reviews"] }`. `getReviews()` in `lib/reviews-data.ts` is rewritten to
call Sanity and map documents → the §4 `Review` shape. Image URLs built with
`@sanity/image-url` at the sizes the theme requests; natural aspect from asset
`metadata.dimensions`; LQIP available for blur-up.

**Revalidation:** Sanity **webhook** on publish → `POST /api/revalidate`
(existing endpoint, `revalidateTag("reviews")`, guarded by `REVALIDATE_SECRET`).

**Datasets:** `production` (+ optional `development`). ⟢ GRILL: one dataset or
prod/dev split? Recommended: start with `production` only; add `development` if
Bryan wants a staging space.

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

**Form → field mapping (`/api/pitch`):**
- Writer Name → `Writer Name`
- Pitch → `Pitches` (writers are told to include a **proposed filing date** and
  their **photo caption** here per the guidelines)
- Attachment(s) → `Attachments`
- Email → `Writer Email` *(blocked — see snag)*
- `Status` left empty (Bryan sets it during triage)

**The `aiText` snag:** `Writer Email` is an AI-computed field; the Airtable API
cannot write user input into it. Options:
1. **(Recommended)** Bryan converts `Writer Email` to a plain **single-line text**
   / email field in his base (his change, trivial, non-structural to us).
2. We prepend the email into the `Pitches` text (works today, uglier).
⟢ GRILL: which option — ideally (1).

**Attachments:** Airtable attachment fields accept records referencing a
**public URL**, not raw multipart. Options: (a) collect the file, upload to our
own store / Vercel Blob, pass the URL to Airtable; (b) defer attachments in v1
and have writers paste an image link; (c) Airtable's newer upload-attachment
endpoint. ⟢ GRILL: attachment mechanics + whether attachments are required at
pitch time (guidelines say one photo is required for the *review*, not
necessarily the pitch).

**Security:** PAT stays in gitignored `.env.local`, read via `process.env`, never
echoed or committed. New base id → env var (e.g. `AIRTABLE_PITCH_BASE_ID`).

---

## 9. Copy & assets (Bryan's real materials)

Source files in repo: `The Broadway Art Ledger.md` (About + tagline + embedded
image), `Submission Instructions.md` (Submit guide + guidelines).

- **Tagline / strap:** "Incisive criticism and equitable publishing in the New
  York Metropolitan area."
- **About page:** Bryan's `image1` (base64 in the md → extract to `public/`) atop
  the four-paragraph About/Submissions statement (ending "…Because King Kong died
  here, and it's where the best art lives.").
- **Submit page:** "Anonymous Pitch Guide" intro + the 10-bullet Review
  Guidelines + contact `thebroadwayartledger@gmail.com`. Note the guidelines ask
  writers to include a proposed filing date and to supply their own caption — both
  live in the pitch text (keeps the form to four fields).
- **Footer:** facts (blind/anonymous pitches; one marquee image; $200 flat fee) +
  motto + colophon.
⟢ GRILL: is the current placeholder About/Submit prose replaced verbatim by
Bryan's md, or lightly edited? Default: use Bryan's md as the source of truth.

---

## 10. Testing plan

- **Content model / rendering:** the Phase 0 fixture and the Phase 2 Sanity seed
  render identically → proves the contract holds across data sources.
- **Design:** manual review by Bryan on `/` (feed) and a permalink; responsive
  check at mobile widths; keyboard focus + reduced-motion pass.
- **Sanity:** publish an edit in Studio → confirm the webhook revalidates and the
  change appears; malformed doc (missing image/date) degrades gracefully.
- **Airtable pitch:** submit the form → row appears with correct field mapping;
  error path (Airtable down / validation) shows the Submit error UX; success
  shows the confirmation. Verify no PAT leakage in client bundle.
- **Routing:** `/` finalized, `/designs` exploration intact, `/t/[theme]` still
  browsable, old review URLs handled.
- **Build:** `next build` clean (types + lint) before cutover.

---

## 11. Decision log

- **Vercel ↔ Sanity integration: INSTALL.** It provisions the Sanity project,
  injects env vars, and consolidates billing — removing exactly the setup friction
  Josh is unfamiliar with — while the app code (Studio embed, GROQ, Portable Text,
  images, revalidation) is written the same either way. Manual CLI path documented
  as fallback.
- **Feed model: full essays inline** (newest first), permalinks also exist.
- **Show link: link the dateline itself** (no trailing "For more information"
  sentence).
- **Reviews from Sanity; pitches to Airtable** — two separate planes; app never
  reads reviews from Airtable after Phase 2.
- **Do not modify Bryan's Airtable structure** (the one email-field fix is his to
  make).

---

## 12. Open questions for `/grill-me`

Grouped by area. These are the inputs needed before/while building.

**Content model**
1. Does each review have its **own headline** distinct from the show name, or are
   pieces titled by the show? (affects `headline` vs `showName`)
2. Exact **date format** (CMOS): `May 15–June 13, 2026` confirmed? Same-year and
   same-month collapsing rules?
3. Any **body block types** beyond paragraphs/italic/links (blockquote, inline
   image, strong)?

**Design**
4. **First-class routes** for the real site vs. a `/` theme module? (rec:
   first-class)
5. Keep the **two-squares Mark** as an accent, or wordmark-only identity?
6. Ink-blue accent exactly as Broadside `#1e3a8a`, or adjust?
7. Footer: keep the **facts list** or go more minimal?

**Sanity**
8. Has the **Sanity account/project** been created yet, or do we provision fresh
   via the Vercel integration?
9. **One dataset** (`production`) or a prod/dev split?
10. Studio at `/studio` on the main domain acceptable, or separate?

**Airtable / pitches**
11. **`Writer Email` fix** — Bryan converts it to a text field (rec) or we fold
    email into the pitch text?
12. **Attachments** — required at pitch time? Upload mechanism (Vercel Blob →
    URL / paste a link / defer to v1)?
13. Should `Status` stay untouched by our writes (Bryan triages)? (assumed yes)

**Copy**
14. Use Bryan's md copy **verbatim** for About/Submit, or lightly edited?

**Domain & email**
15. What **domain** is Bryan buying? (affects canonical URLs, Sanity CORS,
    webhook, email)
16. Does he want **email at the domain**, and what's the budget? Orientation:
    - **Cloudflare Email Routing** — free forwarding `you@domain → Gmail`, pair
      with Gmail "send as" for sending. ~$0.
    - **Zoho Mail** — free tier, 1 domain / limited users.
    - **Fastmail** — ~$3–5/user/mo, clean.
    - **Google Workspace** — ~$7/user/mo, familiar (he already uses Gmail).
    Recommendation for a single contact address: Cloudflare Routing (free) +
    Gmail send-as, unless he wants full mailboxes → Workspace/Fastmail.

**Deployment**
17. Confirm **Vercel** as host and that we install the Sanity integration there.
18. Revalidation secret + webhook wiring env available in Vercel?

---

## 13. What lands where (file-level orientation)

- **New:** `app/page.tsx` (finalized feed), `app/about/page.tsx`,
  `app/submit/page.tsx`, `app/reviews/[slug]/page.tsx`, the finalized theme's
  styles, `app/studio/[[...tool]]/page.tsx`, `sanity/` (schema, client, queries),
  `content/reviews-fixture.ts` (Phase 0 mock).
- **Moved:** current `app/page.tsx` exploration → `app/designs/page.tsx`
  (`/t/[theme]`, `/lab` stay).
- **Rewritten:** `lib/reviews-data.ts` (Airtable read → Sanity read),
  `app/api/pitch/route.ts` (→ Pitch Submissions base), `content/reviews.ts` type +
  chrome copy.
- **Retired after cutover:** `app/api/photo/*` (reviews), Airtable "Reviews"
  read path, `no`/`exhibition`/`venue`/`artist`/`artwork` model fields.
- **Untouched:** the 8 exploration themes + Lab (preserved under `/designs`).
```
