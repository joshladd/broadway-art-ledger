# The Broadway Art Ledger — Design & Research Brief

A working prototype: one publication, eight complete designs, shared content, fully
clickable. This brief captures what we learned and the direction for each design.

## The publication (Bryan's brief)

- Art criticism for the **New York metropolitan area**. Reviews **200–400 words**, **one
  marquee image** each, a **big bold show/gallery title**, then the **author byline**.
- Pages: a **continuous vertical feed** of reviews, a **review** page, an
  **About/Submissions** page, and a **Submit** (blind, anonymous pitch) form.
- Tone: rigorous, witty, anti-jargon. Model: pitches read blind; published authors paid a
  $200 flat fee; smartphone marquee photos preferred. "King Kong died here, and it's where
  the best art lives."
- Reference he named: **4Columns** ("simple serif"), plus Paris Review, Triple Canopy, e-flux.
- Bryan is the **sole author**. So: no multi-user auth; content is edited by one person.

## What the research changed (why v1 read as "AI")

Two dossiers (`references/reference-sites.md`, `references/art-web-design.md`) — sites read
from their *served CSS*, not from memory. The load-bearing findings:

1. **Typeface, not layout, separates bespoke from templated.** Every artful art-world site
   commissions or licenses a real display face (Frieze, Aperture, ArtReview's Lexicon,
   Mousse/Dia's JJannon, the Rail's Untitled). The templated ones have fine layouts and
   *system/stock fonts*. → We use characterful faces (Fraunces, Newsreader, Syne, Bricolage
   Grotesque, Archivo, Space Mono), never system-default.
2. **One brand ink, never a palette.** Memorable sites are named after their accent (032c =
   Pantone 032C red; Cabinet orange; Paris Review magenta; 4Columns crimson). A single
   confident ink on **off-white** (never `#fff`) reads more expensive than any gradient.
3. **The artwork is the only permitted spectacle.** MoMA/Pace codify "never crop the art,
   minimal UI." One high-res image per review, treated with respect, carries the page.
4. **Field grammar:** serif headline + grotesque furniture + mono metadata; optical size
   cuts; asymmetry within a grid; whitespace held at tension; borderless structure.
5. **Two roads to bespoke:** radical *restraint* (e-flux/Mousse/Aperture: 1–2 faces, no
   color) or *structural invention* (Triple Canopy's reading engine). Neither uses decoration
   or scroll effects. Motion is pacing only.

### AI tells to avoid (the exact opposite of the art-world idiom)
Inter/Space-Grotesk-as-idea · indigo→purple gradients · default dark mode · colored
left-border cards · three-icon feature rows · centered hero + badge · uniform rounded boxes ·
glassmorphism · bento grids · SaaS forms · emoji section markers · pure `#fff`.

## The eight designs (all consistent with Bryan's brief)

Each is a full identity applied to all four pages. Distinctiveness comes from **type +
composition + one signature move**, not gimmicks. Off-white grounds unless noted.

| # | Key | Name | Road | Type | Ink / ground | Signature |
|---|-----|------|------|------|--------------|-----------|
| 1 | `ledger` | The Ledger | restraint | Fraunces / Newsreader / Space Mono | cream + house-red | disciplined column; hairline `Section · Date · No` bar |
| 2 | `kunsthalle` | Kunsthalle | restraint (sans) | Archivo / Space Mono | gallery white + near-black | museum-wall minimalism; huge whitespace, tiny type, big plates |
| 3 | `broadside` | Broadside | structural | Bricolage Grotesque / Newsreader | warm paper + ink-blue | asymmetric editorial grid; images break the measure |
| 4 | `nocturne` | Nocturne | atmosphere | Newsreader / Space Mono | charcoal + ivory + warm gold | deliberate dark gallery; glowing plates |
| 5 | `index` | The Index | structural | Archivo / Fraunces / mono | paper + crimson | 4Columns reimagined: a running archive/reading engine |
| 6 | `marquee` | Marquee | type identity | Syne / Newsreader | bone + ink | the oversized wordmark *is* the design |
| 7 | `plate` | Plate | restraint | Fraunces (oldstyle figures) / Archivo | ivory + ink + restrained gold | catalogue-raisonné numbering + tabular metadata |
| 8 | `riso` | Riso | color-as-position | Bricolage Grotesque / mono | off-white + two inks | duotone image treatment as house style |

## Do / Don't checklist (applies to every design)

**Do:** commit to the assigned display face; one ink on off-white; one high-res image per
review as the only spectacle; serif headline + grotesque furniture + mono metadata; optical
size cuts; asymmetry within a grid; generous whitespace; plain single-column serif for
About; a plainspoken (never SaaS) Submit form; light + tasteful motion only (hover underline,
quiet fade).

**Don't:** system fonts; more than ~3 hues; crop or decorate the art; rounded card grids;
left-border accent cards; centered hero + badge; gradients; emoji; pure white; scroll effects.

## Architecture (prototype → fully usable)

- **Next.js + TypeScript.** Shared content layer (`content/reviews.ts`) — every theme reads
  it, so switching design never touches content. Routes: `/t/[theme]`, `/t/[theme]/r/[slug]`,
  `/t/[theme]/about`, `/t/[theme]/submit`. Persistent switcher flips theme, keeps your place.
- **No database.** Reviews are content; Bryan is sole author → **git-based CMS (Keystatic)**:
  he writes in `/keystatic`, it commits to GitHub, Vercel redeploys. Free, versioned, portable.
- **Submissions** (anonymous pitches): a form service or tiny serverless store — no DB.
- **Hosting:** Vercel. **Repo:** `joshladd/broadway-art-ledger`.
