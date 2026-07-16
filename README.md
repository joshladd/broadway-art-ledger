# The Broadway Art Ledger

An art-criticism publication for the New York metropolitan area — **one publication, eight
complete designs, shared content.** Reviews run 200–400 words with one marquee image; there's
an About/Submissions page and a blind, anonymous pitch form. Pick a design on the home page
and use the bottom switcher (or ← →) to flip designs while keeping your place.

## Run it

```bash
npm install
npm run dev            # http://localhost:3000  (add -- -p 3009 if 3000 is taken)
```

Copy `.env.example` → `.env.local` and fill in the Airtable vars: `AIRTABLE_TOKEN`,
`AIRTABLE_BASE_ID`, `AIRTABLE_TABLE`.

## How it's built

- **Next.js (App Router, v16) + React 19 + TypeScript.** No database, no CMS to run.
- **Data lives in Airtable:**
  - **Reviews** table → published reviews. `lib/reviews-data.ts#getReviews()` fetches it with
    `next: { revalidate: 60 }` — pages are prerendered at build (SSG) and refresh from Airtable
    every 60s, so edits go live within a minute with no redeploy. The `Published` field gates
    visibility.
  - **Pitches** table → blind, anonymous submissions from the site's form via `/api/pitch`
    (Status = New). Triaged in Airtable through `New → Under Review → Accepted / Rejected`;
    accepted pitches flow to the **Accepted** table (the commissioning queue).
- **Marquee images:** each review carries one uploaded `Photo` attachment in Airtable, served
  through `/api/photo/[id]` — a stable, edge-cached proxy (resized, robust to Airtable's
  expiring URLs). The runtime never reads a bundled path; `public/art/` holds only the CC0
  originals that seeded those attachments.
- **Static chrome** (masthead/nav/about text/submit fields) lives in `content/reviews.ts`.
- **Designs (themes):** `themes/<key>/` — each exports a `ThemeModule` with its own
  `styles.module.css`, all consuming the shared `Review` shape. Registered in `lib/themes.ts`.
- **Routes:** `/` (design picker) · `/t/[theme]` (feed — full reviews inline) ·
  `/t/[theme]/about` · `/t/[theme]/submit`.
- **Fonts:** self-hosted via `next/font` (Fraunces, Newsreader, Archivo, Space Mono).

## Deploy (Vercel)

Add `AIRTABLE_TOKEN`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE` in Project → Settings → Environment
Variables, then deploy. Reviews render at build and revalidate; pitches and photos work at runtime.

See `docs/DESIGN-BRIEF.md` for the research and the eight design directions.
