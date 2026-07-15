# The Broadway Art Ledger

A working prototype of an art-criticism publication for the New York metropolitan area —
**one publication, eight complete designs, shared content, fully clickable.**

Reviews run 200–400 words with one marquee image; there's an About/Submissions page and a
blind, anonymous Submit form. Pick a design on the home page, click through the whole site,
and use the bottom switcher (or ← →) to flip designs while keeping your place.

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000   (this repo also runs on other ports if 3000 is taken)
```

Or with Docker:

```bash
docker build -t art-ledger .
docker run -p 3000:3000 art-ledger
```

## How it's built

- **Next.js (App Router) + TypeScript.**
- **Shared content layer:** `content/reviews.ts` — every design reads the same reviews,
  about text, and submit schema. Switching design never touches content.
- **Designs (themes):** `themes/<key>/` — each exports a `ThemeModule` (Home / ReviewPage /
  About / Submit) and its own `styles.module.css`. Registered in `lib/themes.ts`.
- **Routes:** `/` (design picker) · `/t/[theme]` (feed) · `/t/[theme]/r/[slug]` (review) ·
  `/t/[theme]/about` · `/t/[theme]/submit`. Pitches POST to `/api/pitch`.
- **Fonts:** art-world faces (Fraunces, Newsreader, Syne, Bricolage Grotesque, Archivo,
  Space Mono) via CSS variables in `app/globals.css`.
- **Artworks:** public-domain works (CC0, Art Institute of Chicago) in `public/art/`.

See `docs/DESIGN-BRIEF.md` for the research and the eight design directions.

## Next steps (post-design)

- **Content editing (fully usable):** wire **Keystatic** (git-based CMS) so reviews are
  edited in-app at `/keystatic` and commit to GitHub — no database.
- **Submissions:** point `/api/pitch` at a form service (Formspree/Basin) or a small store.
- **Hosting:** Vercel.
