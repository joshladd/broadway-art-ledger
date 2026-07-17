# Finalized Site on Mock Data — Implementation Plan (Plan 1 of 2)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the finalized Broadway Art Ledger site — Reviews, Archive, About, Submit — rendering from an in-repo mock fixture, with the design exploration frozen and moved to `/designs`.

**Architecture:** A new content model (`content/review.ts`) lives beside the untouched legacy one. The real site occupies first-class routes (`/`, `/archive`, `/about`, `/submit`) built from Kunsthalle's layout recolored to Broadside's palette. The exploration is frozen onto the legacy type + its existing static seed and moved under `/designs`, so it can never be broken by the live model. Review bodies are Portable Text from day one, so Plan 2 (Sanity) only swaps the data source.

**Tech Stack:** Next.js 16.2.10 (App Router), React 19, TypeScript strict, CSS Modules, fuse.js 7.5, `@portabletext/react`, `node:test` via `tsx`.

**Spec:** `docs/superpowers/specs/2026-07-16-broadway-art-ledger-epic-design.md`

## Global Constraints

- **The app surface carries only what Bryan explicitly called out.** No invented branding, chrome, or copy. Ideas go to `docs/IDEAS.md`.
- **Boundary:** functional microcopy IS ours (search placeholder, no-results, empty states, form labels/buttons). Plain and neutral. Test: *would Bryan recognize this as writing, or as a button?*
- **Never modify** `content/reviews.ts`'s `Review` type or its `reviews[]` seed — 38 exploration files depend on them.
- **Palette (Broadside, verbatim):** `--bg:#f2efe6` `--ink:#1b1a16` `--ink2:#6a675c` `--rule:#d5d0c1` `--blue:#1e3a8a`
- **Fonts (existing CSS vars):** `--f-fraunces` (display), `--f-newsreader` (body), `--f-mono` (labels/nav/meta)
- **Four surfaces only.** No review permalinks.
- **No footer.** Pages simply end.
- **No Mark.** `components/Mark.tsx` is not imported by any real-site file.
- **Copy is Bryan's, verbatim** from `The Broadway Art Ledger.md` and `Submission Instructions.md`.
- **Dates: CMOS.** En dash, no spaces, collapse the repeated month.
- Build gate for every task: `npm run build` passes.

---

### Task 1: Content model + CMOS date formatter + mock fixture

**Files:**
- Create: `content/review.ts`
- Create: `lib/format-date.ts`
- Create: `lib/format-date.test.ts`
- Create: `content/reviews-fixture.ts`
- Modify: `package.json` (add `test` script, add `@portabletext/react`)

**Interfaces:**
- Consumes: nothing.
- Produces: `type Review`, `type ReviewImage` from `@/content/review`; `formatRange(startISO: string, endISO: string): string` from `@/lib/format-date`; `fixtureReviews: Review[]` from `@/content/reviews-fixture`.

- [ ] **Step 1: Install the Portable Text renderer**

```bash
npm install @portabletext/react
```

- [ ] **Step 2: Add the test script to `package.json`**

In `"scripts"`, add:

```json
"test": "node --import tsx --test lib/format-date.test.ts"
```

- [ ] **Step 3: Write the failing test for `formatRange`**

Create `lib/format-date.test.ts`:

```ts
import test from "node:test";
import assert from "node:assert/strict";
import { formatRange } from "./format-date";

test("same year, different months — Bryan's example", () => {
  assert.equal(formatRange("2026-05-15", "2026-06-13"), "May 15–June 13, 2026");
});

test("same month and year — CMOS collapses the repeated month", () => {
  assert.equal(formatRange("2026-05-15", "2026-05-27"), "May 15–27, 2026");
});

test("spanning years — both years shown", () => {
  assert.equal(
    formatRange("2025-12-10", "2026-01-20"),
    "December 10, 2025–January 20, 2026",
  );
});

test("uses an en dash, never a hyphen", () => {
  assert.ok(formatRange("2026-05-15", "2026-06-13").includes("–"));
  assert.ok(!formatRange("2026-05-15", "2026-06-13").includes("-"));
});

test("missing end date renders the start alone", () => {
  assert.equal(formatRange("2026-05-15", ""), "May 15, 2026");
});

test("missing start date renders empty", () => {
  assert.equal(formatRange("", "2026-05-15"), "");
});
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot find module `./format-date`.

- [ ] **Step 5: Implement `formatRange`**

Create `lib/format-date.ts`:

```ts
// CMOS date ranges. Bryan's guidelines state "We follow CMOS", and his example
// is "May 15–June 13, 2026". En dash, no surrounding spaces.
//
//   same year          -> May 15–June 13, 2026
//   same month + year  -> May 15–27, 2026        (CMOS collapses the month)
//   spanning years     -> December 10, 2025–January 20, 2026

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EN_DASH = "–";

type Parts = { y: number; m: number; d: number };

// Parse a YYYY-MM-DD string WITHOUT going through Date, which would apply a
// timezone shift and can roll the day backwards for users west of UTC.
function parse(iso: string): Parts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) };
}

function monthDay(p: Parts): string {
  return `${MONTHS[p.m]} ${p.d}`;
}

function full(p: Parts): string {
  return `${monthDay(p)}, ${p.y}`;
}

export function formatRange(startISO: string, endISO: string): string {
  const s = parse(startISO);
  if (!s) return "";
  const e = parse(endISO);
  if (!e) return full(s);

  if (s.y !== e.y) return `${full(s)}${EN_DASH}${full(e)}`;
  if (s.m === e.m) return `${monthDay(s)}${EN_DASH}${e.d}, ${s.y}`;
  return `${monthDay(s)}${EN_DASH}${monthDay(e)}, ${s.y}`;
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — 6 tests.

- [ ] **Step 7: Create the content model**

Create `content/review.ts`:

```ts
import type { PortableTextBlock } from "@portabletext/types";

// The live content contract: what Sanity produces and the finalized site renders.
//
// DISTINCT from the legacy `Review` in content/reviews.ts, which is frozen and
// belongs to the /designs exploration. Do not merge them — see the spec's
// "Why the freeze".

export type ReviewImage = {
  url: string;
  width: number;   // true pixel width, for natural aspect
  height: number;  // true pixel height
  alt: string;     // accessibility only, never rendered as visible copy
  caption: string; // writer-provided; renders aligned to the image
};

export type Review = {
  slug: string;        // identity key only — NOT a URL. There are no review pages.
  headline: string;    // the review's own editorial title
  showName: string;    // free-text dateline label (gallery, institution, or show)
  startDate: string;   // ISO YYYY-MM-DD
  endDate: string;     // ISO YYYY-MM-DD
  showUrl: string;     // dateline link target; empty -> dateline renders unlinked
  body: PortableTextBlock[];
  image: ReviewImage;
  tagline?: string;    // renders IFF non-empty (Bryan's per-review opt-in)
  publishedAt: string; // ISO datetime; ordering key, newest first
};
```

- [ ] **Step 8: Create the mock fixture**

Create `content/reviews-fixture.ts`. This is Phase 1 scaffolding — Plan 2 replaces it with Sanity. Dates and show URLs are fabricated; the art is the real CC0 set already in `public/art`.

```ts
import type { PortableTextBlock } from "@portabletext/types";
import type { Review } from "./review";

// Mock data for building the finalized design before Sanity is wired (Plan 2).
// Bodies are Portable Text so the renderer is real from day one.

let key = 0;
// Minimal Portable Text paragraph builder — mirrors what Sanity emits.
function p(text: string): PortableTextBlock {
  key += 1;
  return {
    _type: "block",
    _key: `b${key}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `s${key}`, text, marks: [] }],
  } as unknown as PortableTextBlock;
}

export const fixtureReviews: Review[] = [
  {
    slug: "toulouse-lautrec-night-work",
    headline: "Toulouse-Lautrec: Night Work",
    showName: "The Morgan Library & Museum",
    startDate: "2026-05-15",
    endDate: "2026-06-13",
    showUrl: "https://www.themorgan.org/",
    publishedAt: "2026-07-11T09:00:00.000Z",
    body: [
      p("Everyone remembers the crowd, but the painting belongs to the woman shoved half out of the frame at right, her face lit acid green by unseen footlights. She is the reason to make the trip. Lautrec painted Montmartre from the inside and refuses to sell it to us as spectacle. The dancers are off the clock. The drinkers look bored."),
      p("The Morgan's hang leans into the cropping, and it pays off. What reads at first as loose reportage is really composition as ambush. Lautrec cuts the bodies at the balustrade so the eye can never quite come to rest, and the whole machine is built to deposit you, finally, on that ghoulish, gorgeous, gaslit face."),
      p("What Lautrec understood is that entertainment is labor, and that the people who perform intimacy for money are the most watched and least seen figures in modern life. He watched them. He saw them. This small, sharp show lets you do the same."),
    ],
    image: {
      url: "/art/art-01.jpg",
      width: 1600,
      height: 1229,
      alt: "Nightlife scene at the Moulin Rouge with figures around a table and a woman's green-lit face in the foreground.",
      caption: "Henri de Toulouse-Lautrec, At the Moulin Rouge, 1892–95. Public domain, Art Institute of Chicago.",
    },
  },
  {
    slug: "van-gogh-in-arles",
    headline: "Van Gogh in Arles",
    showName: "The Metropolitan Museum of Art",
    startDate: "2026-05-02",
    endDate: "2026-05-24",
    showUrl: "https://www.metmuseum.org/",
    publishedAt: "2026-07-04T09:00:00.000Z",
    tagline: "A room painted by someone desperate to believe in rest.",
    body: [
      p("The tilt is the tell. The floor pitches forward, the back wall refuses to meet its neighbors at any angle a builder would recognize, and yet Van Gogh insisted, in letter after letter, that this picture was about rest. It is the most strenuous calm ever committed to canvas."),
      p("That blue is not the blue of a restful room; it is a blue with its jaw set. The bed is a slab of chrome yellow. Van Gogh believed color could do the work of sedation. He was wrong, and the wrongness is the painting's whole achievement: you feel him wanting the calm so badly that the wanting becomes the subject."),
      p("My advice is to skip the vitrines on the first pass. The painting says everything the letters do, in brushwork laid down with a carpenter's insistence that if the room is only built solidly enough it might finally hold still. It doesn't. That is the point."),
    ],
    image: {
      url: "/art/art-02.jpg",
      width: 1600,
      height: 1273,
      alt: "Van Gogh's bedroom in Arles with blue walls, red blanket, yellow bed and wooden furniture in bold flat color.",
      caption: "Vincent van Gogh, The Bedroom, 1889. Public domain, Art Institute of Chicago.",
    },
  },
  {
    slug: "the-face-in-the-glass",
    headline: "The Face in the Glass",
    showName: "Brooklyn Museum",
    startDate: "2025-12-10",
    endDate: "2026-01-20",
    showUrl: "",
    publishedAt: "2026-06-27T09:00:00.000Z",
    body: [
      p("Van Gogh painted himself compulsively — more than thirty times in two years — for the least romantic of reasons: models cost money and a mirror is free. Keep that in mind at the Brooklyn Museum, where the 1887 head hangs among four centuries of people arranging their own faces for posterity. It cuts through the room like a slap."),
      p("The blue-green background churns like a sky about to do something violent, and the face — ginger-bearded, hollow-cheeked, wary — holds against it, gathered out of the same nervous strokes yet refusing to come apart. Technique becomes temperament."),
      p("He is not asking to be liked. He is checking, with a kind of grim curiosity, whether the man in the glass is still there, still holding, still worth the paint. He was, and this is the portrait that knows it."),
    ],
    image: {
      url: "/art/art-03.jpg",
      width: 1600,
      height: 2011,
      alt: "Van Gogh self-portrait with red beard against a swirling blue-green background of short brushstrokes.",
      caption: "Vincent van Gogh, Self-Portrait, 1887. Public domain, Art Institute of Chicago.",
    },
  },
];
```

- [ ] **Step 9: Verify types and build**

Run: `npx tsc --noEmit && npm run build`
Expected: no type errors; build succeeds.

- [ ] **Step 10: Commit**

```bash
git add content/review.ts content/reviews-fixture.ts lib/format-date.ts lib/format-date.test.ts package.json package-lock.json
git commit -m "Add live content model, CMOS date formatter, and mock fixture"
```

---

### Task 2: Freeze the exploration and move it to /designs

Moves the exploration off live data and out of the real site's routes. Nothing about the 9 themes or 7 lab designs changes internally — only their data source and their URLs.

**Files:**
- Create: `app/designs/page.tsx` (moved from `app/page.tsx`)
- Create: `app/designs/archive/page.tsx`, `app/designs/archive/Archive.tsx`, `app/designs/archive/archive.module.css` (moved from `app/archive/`)
- Delete: `app/page.tsx`, `app/archive/`
- Modify: `app/lab/[design]/page.tsx`, `app/t/[theme]/page.tsx`, `app/t/[theme]/archive/page.tsx` (read the static seed, not `getReviews()`)
- Modify: `themes/{ledger,kunsthalle,broadside,nocturne,index,marquee,plate,riso}/index.tsx` (archive href)

**Interfaces:**
- Consumes: `reviews` (the legacy static seed) from `@/content/reviews`.
- Produces: the exploration at `/designs`, `/designs/archive`, `/t/[theme]`, `/lab`. No exploration file imports `@/lib/reviews-data`.

- [ ] **Step 1: Move the exploration index**

```bash
git mv app/page.tsx app/designs/page.tsx
```

- [ ] **Step 2: Move the shared exploration archive (frees `/archive` for the real site)**

```bash
git mv app/archive app/designs/archive
```

- [ ] **Step 3: Point the exploration at the static seed**

In each of `app/t/[theme]/page.tsx`, `app/t/[theme]/archive/page.tsx`, `app/lab/[design]/page.tsx`, and `app/designs/archive/page.tsx`:

Replace the import:

```ts
import { getReviews } from "@/lib/reviews-data";
```

with:

```ts
// The exploration is frozen: it renders the static legacy seed, never live data.
// This is what keeps /designs immune to changes in the live content model.
import { reviews } from "@/content/reviews";
```

Replace the call:

```ts
const reviews = await getReviews();
```

with:

```ts
// (no fetch — `reviews` is imported statically)
```

Remove any now-unused `export const revalidate = 15;` from these files, and delete the `await` if it leaves an `async` function with nothing to await (keep `async` where Next requires it for `params`/`searchParams`).

- [ ] **Step 4: Repoint the 8 themes' archive links**

In each of `themes/ledger/index.tsx`, `themes/kunsthalle/index.tsx`, `themes/broadside/index.tsx`, `themes/nocturne/index.tsx`, `themes/index/index.tsx`, `themes/marquee/index.tsx`, `themes/plate/index.tsx`, `themes/riso/index.tsx`:

Change:

```tsx
{ label: "Archive", href: `/archive?from=${t}` },
```

to:

```tsx
{ label: "Archive", href: `/designs/archive?from=${t}` },
```

- [ ] **Step 5: Repoint the per-theme archive fallback redirect**

In `app/t/[theme]/archive/page.tsx`, change:

```ts
if (!Archive) redirect(`/archive?from=${t}`);
```

to:

```ts
if (!Archive) redirect(`/designs/archive?from=${t}`);
```

- [ ] **Step 6: Fix the exploration archive's back-link**

In `app/designs/archive/page.tsx`, the no-`from` fallback currently points at `/` labelled "← All designs". `/` is about to become the real site. Change it to:

```ts
const back =
  typeof from === "string" && from.length > 0
    ? { href: `/t/${from}`, label: "← Back to the design" }
    : { href: "/designs", label: "← All designs" };
```

- [ ] **Step 7: Fix any `/` links inside the exploration index**

In `app/designs/page.tsx`, update any self-referential links from `/` to `/designs` (e.g. a home/back link). Leave links to `/t/<theme>` and `/lab` as they are.

- [ ] **Step 8: Verify the freeze**

Run: `grep -rn "reviews-data" app/designs app/t app/lab themes/ lab/`
Expected: **no output** — no exploration file imports live data.

Run: `grep -rn '"/archive' app/ themes/ lab/`
Expected: **no output** — nothing points at the old shared archive path.

- [ ] **Step 9: Build**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds. `/` will 404 until Task 4 — that is expected at this step.

- [ ] **Step 10: Commit**

```bash
git add -A app themes
git commit -m "Freeze the exploration on the static seed and move it to /designs"
```

---

### Task 3: Bryan's copy + the About image asset

**Files:**
- Create: `scripts/extract-about-image.mts`
- Create: `public/about.png` (generated)
- Create: `content/site.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `strap`, `aboutStatement`, `submitGuide`, `SUBMIT_FORM_URL` from `@/content/site`; the asset `/about.png`.

- [ ] **Step 1: Write the extraction script**

The About image is a base64 PNG embedded as a markdown reference-link in `The Broadway Art Ledger.md`. Create `scripts/extract-about-image.mts`:

```ts
// One-off: decode Bryan's About image out of his markdown into a real asset.
// Bryan explicitly asked for this image on the About page.
import { readFileSync, writeFileSync } from "node:fs";

const md = readFileSync("The Broadway Art Ledger.md", "utf8");
const m = /\[image1\]:\s*<?data:image\/png;base64,([A-Za-z0-9+/=]+)>?/.exec(md);
if (!m) throw new Error("image1 data-URI not found in The Broadway Art Ledger.md");

const buf = Buffer.from(m[1], "base64");
if (buf.subarray(0, 8).toString("binary") !== "\x89PNG\r\n\x1a\n") {
  throw new Error("decoded blob is not a PNG");
}
writeFileSync("public/about.png", buf);
console.log(`wrote public/about.png (${buf.length} bytes)`);
```

- [ ] **Step 2: Run it**

Run: `npx tsx scripts/extract-about-image.mts`
Expected: `wrote public/about.png (209739 bytes)`

- [ ] **Step 3: Record the image's pixel dimensions**

Run:

```bash
npx tsx -e "import {readFileSync} from 'node:fs'; const b=readFileSync('public/about.png'); console.log('width', b.readUInt32BE(16), 'height', b.readUInt32BE(20));"
```

Note the two numbers — they are needed for `next/image` in Task 7.

- [ ] **Step 4: Create the copy module**

Create `content/site.ts`. **Every string here is Bryan's, verbatim** from `The Broadway Art Ledger.md` and `Submission Instructions.md`. Do not paraphrase, trim, or improve.

```ts
// Bryan's copy, verbatim. Sources:
//   - The Broadway Art Ledger.md   (tagline, About statement, About image)
//   - Submission Instructions.md   (submission guide + review guidelines)
// The rule for this site: only copy Bryan wrote reaches the surface.

export const wordmark = "The Broadway Art Ledger";

export const strap =
  "Incisive criticism and equitable publishing in the New York Metropolitan area";

export const aboutStatement = {
  title: "About/Submissions",
  body: [
    "A publication solely focused on art criticism in the New York metropolitan area, with all reviews between 200 and 400 words. Pitches will be considered and approved in the order they are received in a blind review process via an anonymous form. The publication of a review will not be based on the show’s opening or closing date, ad revenue, or a writer’s reputation; it will be determined solely by its promise and place in the queue. We are committed to a more equitable submission and publication process.",
    "While we welcome early pitches before a show’s opening or during its run, we also accommodate reviews of shows that have closed or pitches that won’t be published until after the final day—something that stuck with you, something that maybe was rejected by another publication, or something that you’ve recently seen. Our pitch process aims to remove bias and focus on a piece's potential. Authors of published reviews will be compensated with a flat fee of $200. There is one marquee image per review, and we prefer photos taken by the author with their smartphone over professional photography.",
    "The Broadway Art Ledger is an evolving project; however, there are guiding principles. We will not publish exhibition summaries, theoretical jargon, or glorified press releases: we are looking for an original position on the show. What’s at stake, why does this matter, and what is your central argument? This is also not criticism for criticism’s sake; all judgments should be clear and grounded in evidence. With this in mind, we are not prescriptive; if you believe that you have a structure that qualifies for an excellent review, we eagerly welcome that as well.",
    "The notion that art criticism is defunct is hyperbole; it’s stuck in a cycle of hit-or-miss writing that perpetuates mediocrity. The Broadway Art Ledger aims to counter this for the pleasure of strong criticism itself. Unruly features, publication hierarchies, bloated media projects like video and podcasts, the pursuit of profit, and the art world’s news cycle inhibit critical perspectives in prominent art publications. The Broadway Art Ledger is dedicated to succinct, rigorous criticism. And why New York? Because King Kong died here, and it’s where the best art lives.",
  ],
};

// Bryan's public Airtable form. Verified 2026-07-16: renders for a logged-out
// visitor. Not a secret — a public share link, safe to commit.
export const SUBMIT_FORM_URL =
  "https://airtable.com/appi8Pjrcq4G6Lz8p/shrEAVG242D5A34Hk";

export const CONTACT_EMAIL = "thebroadwayartledger@gmail.com";

export const submitGuide = {
  title: "The Broadway Art Ledger Submissions",
  pitchGuideTitle: "Anonymous Pitch Guide",
  intro: [
    "Want to write for The Broadway Art Ledger? Fill out this simple form.",
    "We only accept pitches for reviews that fall within our 200–400-word count. Ideally, keep your pitches to 2–4 sentences. Feeling bold and want to submit a draft of your review? We welcome that as well, but please know that this does not guarantee publication or payment. Also provide a proposed filing date or estimate for how long it will take you to write if approved.",
    "Please do not include any identifying information in your pitch. This will automatically disqualify you from consideration, and that would suck if you have a solid angle!",
    "Our goal in an anonymous pitching process is to blind-review each submission and minimize any name bias on both ends. You don’t know who we are, and we don’t know you. This ensures that your review idea can be judged on its own merits by our editorial team.",
    "We review each submission in the order it was received and only reach out to approved submissions. If you don’t hear back from us within two weeks, we likely did not accept your piece. Please do not contact us regarding the status of your submission.",
  ],
  guidelinesTitle: "Review Guidelines",
  guidelinesIntro: "What we’re looking for and some basic requirements.",
  guidelines: [
    "Pieces must be between 200 and 400 words.",
    "The show must be in the New York Metropolitan area. Beyond the New York metropolitan area, we also consider shows in the Mid-Hudson Valley, so please don’t send us a show in Utica or Buffalo.",
    "Approved pitches aren’t based on the show’s opening and closing dates; however, we do prefer that it’s relatively close to the show's run.",
    "We require authors to submit one photograph, ideally taken from their smartphone, of the show or an artwork. You must also provide the caption.",
    "Writers are compensated with a flat $200 fee that will only be paid in full upon completion of a piece.",
    "If we feel that your first draft isn’t strong enough, we will not move forward with the piece. In this case, you will not be compensated, as our current budget is quite limited and only available for published pieces.",
    "Avoid making your piece read like a press release, and avoid jargon.",
    "We follow CMOS, so ideally write your first draft in that style to the best of your ability.",
    "We do not have the capacity for endnotes at this time. Please hyperlink online sources where possible and otherwise identify your sources.",
    "If we suspect AI-generated writing or plagiarism, we will not move forward with your piece.",
    "If your piece is accepted, please alert us of any potential conflicts of interest. While this does not automatically disqualify you, we will not move forward with pieces that have serious conflicts of interest.",
  ],
  // The "International Art English" essay Bryan links from the jargon guideline.
  jargonEssayUrl: "https://canopycanopycanopy.com/contents/international_art_english",
  outro:
    "Did we miss something? Have any advice on how to improve our process? While we will not give you the status of your submission, please email us at",
};
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add scripts/extract-about-image.mts public/about.png content/site.ts
git commit -m "Extract Bryan's About image and add his copy verbatim"
```

---

### Task 4: Site chrome + the Reviews feed at /

The design core: Kunsthalle's layout, Broadside's palette, Bryan's tweaks.

**Files:**
- Create: `components/site/site.module.css`
- Create: `components/site/Header.tsx`
- Create: `components/site/Dateline.tsx`
- Create: `components/site/Body.tsx`
- Create: `components/site/ReviewArticle.tsx`
- Create: `app/page.tsx`

**Interfaces:**
- Consumes: `Review` from `@/content/review`; `formatRange` from `@/lib/format-date`; `strap`, `wordmark` from `@/content/site`; `fixtureReviews` from `@/content/reviews-fixture`.
- Produces: `<Header active={...} />`, `<Dateline review={...} />`, `<Body value={...} />`, `<ReviewArticle review={...} priority={...} />`, and `styles` from `components/site/site.module.css`.

- [ ] **Step 1: Create the stylesheet**

Create `components/site/site.module.css`:

```css
/* The finalized design: Kunsthalle's museum-wall layout, recolored to
   Broadside's warm paper + ink-blue. Bryan: "2 is perfect, but could we have
   the color of 3?" Palette values are Broadside's, verbatim. */

.root {
  --bg: #f2efe6;
  --ink: #1b1a16;
  --ink2: #6a675c;
  --rule: #d5d0c1;
  --blue: #1e3a8a;

  background: var(--bg);
  color: var(--ink);
  min-height: 100vh;
  font-family: var(--f-newsreader);
  font-size: 18px;
  line-height: 1.62;
  letter-spacing: -0.006em;
  padding-bottom: 96px;
  -webkit-font-smoothing: antialiased;
}

/* ---------- header ---------- */
.header {
  max-width: 1240px;
  margin: 0 auto;
  padding: 40px 56px 0;
}
.headBar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--ink);
  flex-wrap: wrap;
}
.wordmark {
  font-family: var(--f-fraunces);
  font-optical-sizing: auto;
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--ink);
  text-decoration: none;
}
.nav { display: flex; gap: 26px; flex-wrap: wrap; }
.navlink {
  font-family: var(--f-mono);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink2);
  text-decoration: none;
}
.navlink:hover { color: var(--blue); }
.navOn { color: var(--blue); text-decoration: underline; text-underline-offset: 4px; }
.strap {
  margin: 18px 0 0;
  font-family: var(--f-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink2);
  max-width: 52ch;
}

/* ---------- feed ---------- */
.feed {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 56px;
}
.entry { padding: 120px 0 0; }
.entry:first-child { padding-top: 84px; }

.figure { display: block; margin: 0; }
.img {
  width: 100%;
  height: auto;
  display: block;
  background: #e9e5d8;
}
/* Bryan: "Make sure that the captions align with the images." The caption is a
   child of the figure, so it inherits the image's exact width and left edge. */
.caption {
  margin: 10px 0 0;
  font-family: var(--f-mono);
  font-size: 10.5px;
  line-height: 1.5;
  letter-spacing: 0.02em;
  color: var(--ink2);
  max-width: 68ch;
}

.entryText { padding-top: 30px; }

/* Bryan: "Slightly smaller header font for the title."
   Kunsthalle was clamp(38px, 5.2vw, 66px); stepped down one notch. */
.headline {
  font-family: var(--f-fraunces);
  font-optical-sizing: auto;
  font-weight: 760;
  font-size: clamp(34px, 4.6vw, 56px);
  line-height: 1.06;
  letter-spacing: -0.018em;
  margin: 0;
  text-wrap: balance;
}

/* The dateline: "Alex Berns, May 15–June 13, 2026" — linked to the show. */
.dateline {
  margin: 14px 0 0;
  font-family: var(--f-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink2);
}
.datelineLink {
  color: var(--blue);
  text-decoration: none;
  border-bottom: 1px solid color-mix(in srgb, var(--blue) 35%, transparent);
}
.datelineLink:hover { border-bottom-color: var(--blue); }

.tagline {
  margin: 18px 0 0;
  font-size: 21px;
  line-height: 1.45;
  color: var(--ink2);
  max-width: 60ch;
}

/* ---------- prose ---------- */
.prose {
  padding-top: 26px;
  max-width: 68ch;
}
.prose p { margin: 0 0 1.15em; }
.prose a {
  color: var(--blue);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.prose em { font-style: italic; }
.prose strong { font-weight: 700; }
.prose blockquote {
  margin: 1.4em 0;
  padding-left: 20px;
  border-left: 2px solid var(--rule);
  color: var(--ink2);
}
.prose h2, .prose h3, .prose h4 {
  font-family: var(--f-fraunces);
  font-weight: 700;
  margin: 1.6em 0 0.5em;
  line-height: 1.2;
}
.prose h2 { font-size: 26px; }
.prose h3 { font-size: 22px; }
.prose h4 { font-size: 19px; }
.prose ul, .prose ol { margin: 0 0 1.15em; padding-left: 1.4em; }
.prose li { margin: 0 0 0.4em; }

/* ---------- reader pages (About / Submit) ---------- */
.reader {
  max-width: 1000px;
  margin: 0 auto;
  padding: 84px 56px 0;
}
.readerTitle {
  font-family: var(--f-fraunces);
  font-optical-sizing: auto;
  font-weight: 760;
  font-size: clamp(34px, 4.6vw, 56px);
  line-height: 1.06;
  letter-spacing: -0.018em;
  margin: 0 0 28px;
}
.readerBody { max-width: 68ch; }
.readerBody p { margin: 0 0 1.15em; }
.readerBody a { color: var(--blue); text-decoration: underline; text-underline-offset: 3px; }

.aboutFig { margin: 0 0 40px; }
.aboutImg { width: 100%; height: auto; display: block; background: #e9e5d8; }

.subhead {
  font-family: var(--f-fraunces);
  font-weight: 700;
  font-size: 24px;
  margin: 40px 0 6px;
}
.subheadNote {
  font-family: var(--f-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink2);
  margin: 0 0 18px;
}
.guidelines { max-width: 68ch; margin: 0; padding-left: 1.2em; }
.guidelines li { margin: 0 0 0.7em; }

/* The outbound link to Bryan's Airtable form. */
.formLink {
  display: inline-block;
  margin: 8px 0 0;
  padding: 14px 22px;
  background: var(--blue);
  color: var(--bg);
  font-family: var(--f-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 2px;
}
.formLink:hover { background: var(--ink); }

/* ---------- empty state ---------- */
.empty {
  max-width: 1000px;
  margin: 0 auto;
  padding: 84px 56px 0;
  font-family: var(--f-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink2);
}

/* ---------- mobile ---------- */
@media (max-width: 820px) {
  .header { padding: 28px 22px 0; }
  .headBar { gap: 16px; }
  .feed { padding: 0 22px; }
  .reader, .empty { padding-left: 22px; padding-right: 22px; }
  .entry { padding-top: 84px; }
  .entry:first-child { padding-top: 52px; }
  .nav { gap: 18px; }
}

:global(a):focus-visible,
:global(button):focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 3px;
}
```

- [ ] **Step 2: Create the Header**

Create `components/site/Header.tsx`:

```tsx
import { strap, wordmark } from "@/content/site";
import styles from "./site.module.css";

// Bryan: 'Instead of "Current," let's do "Reviews" for now, then shift to
// "Current" and "Archive" in the future.' Archive ships now; only the rename
// is deferred. No Mark, no footer — neither was called out.
const NAV = [
  { label: "Reviews", href: "/" },
  { label: "Archive", href: "/archive" },
  { label: "About", href: "/about" },
  { label: "Submit", href: "/submit" },
];

export function Header({ active }: { active: string }) {
  return (
    <header className={styles.header}>
      <div className={styles.headBar}>
        <a href="/" className={styles.wordmark}>{wordmark}</a>
        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((it) => (
            <a
              key={it.label}
              href={it.href}
              className={`${styles.navlink} ${it.label === active ? styles.navOn : ""}`}
              aria-current={it.label === active ? "page" : undefined}
            >
              {it.label}
            </a>
          ))}
        </nav>
      </div>
      <p className={styles.strap}>{strap}</p>
    </header>
  );
}
```

- [ ] **Step 3: Create the Dateline**

Create `components/site/Dateline.tsx`:

```tsx
import type { Review } from "@/content/review";
import { formatRange } from "@/lib/format-date";
import styles from "./site.module.css";

// Bryan: "The location will be the institution title plus running dates i.e.,
// Alex Berns, May 15–June 13, 2026. Can we hyperlink here?" — yes: the dateline
// itself is the link. With no showUrl it renders as plain text.
export function Dateline({ review }: { review: Review }) {
  const range = formatRange(review.startDate, review.endDate);
  const text = range ? `${review.showName}, ${range}` : review.showName;
  if (!text.trim()) return null;

  return (
    <p className={styles.dateline}>
      {review.showUrl ? (
        <a
          className={styles.datelineLink}
          href={review.showUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      ) : (
        text
      )}
    </p>
  );
}
```

- [ ] **Step 4: Create the Portable Text body renderer**

Create `components/site/Body.tsx`:

```tsx
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import styles from "./site.module.css";

// Sanity's default block content. Bryan's "just hyperlink and italicize" was
// about a hand-rolled CMS; with Sanity we take the defaults. Only links need a
// custom component (for target/rel on external URLs).
const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = String(value?.href ?? "");
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export function Body({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className={styles.prose}>
      <PortableText value={value} components={components} />
    </div>
  );
}
```

- [ ] **Step 5: Create the review article**

Create `components/site/ReviewArticle.tsx`. Order follows Kunsthalle: image → caption → headline → dateline → body. No byline, no №, no credit — none were called out.

```tsx
import Image from "next/image";
import type { Review } from "@/content/review";
import { Dateline } from "./Dateline";
import { Body } from "./Body";
import styles from "./site.module.css";

export function ReviewArticle({ review, priority = false }: { review: Review; priority?: boolean }) {
  return (
    <article className={styles.entry}>
      {/* The caption lives inside the figure, so it aligns to the image's exact
          width and left edge — Bryan: "Make sure that the captions align with
          the images." */}
      <figure className={styles.figure}>
        <Image
          className={styles.img}
          src={review.image.url}
          alt={review.image.alt}
          width={review.image.width}
          height={review.image.height}
          sizes="(max-width: 820px) 100vw, 888px"
          priority={priority}
        />
        {review.image.caption && (
          <figcaption className={styles.caption}>{review.image.caption}</figcaption>
        )}
      </figure>

      <div className={styles.entryText}>
        <h2 className={styles.headline}>{review.headline}</h2>
        <Dateline review={review} />
        {/* Renders only when Bryan actually types one. */}
        {review.tagline?.trim() ? <p className={styles.tagline}>{review.tagline}</p> : null}
      </div>

      <Body value={review.body} />
    </article>
  );
}
```

- [ ] **Step 6: Create the Reviews feed**

Create `app/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { ReviewArticle } from "@/components/site/ReviewArticle";
import { getReviews } from "@/lib/reviews-source";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "The Broadway Art Ledger" };

export default async function ReviewsPage() {
  const reviews = await getReviews();

  return (
    <main className={styles.root}>
      <Header active="Reviews" />
      {reviews.length === 0 ? (
        // Day one: production has no reviews yet. Chrome only — no invented
        // "coming soon". Transient; resolves on Bryan's first publish.
        <div className={styles.empty} />
      ) : (
        <div className={styles.feed}>
          {reviews.map((r, i) => (
            <ReviewArticle key={r.slug} review={r} priority={i === 0} />
          ))}
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 7: Create the data source seam**

This is the single file Plan 2 rewrites to point at Sanity. Everything else stays put.

Create `lib/reviews-source.ts`:

```ts
import type { Review } from "@/content/review";
import { fixtureReviews } from "@/content/reviews-fixture";

// The live site's data source. Plan 1: the in-repo mock fixture.
// Plan 2 replaces the body of getReviews() with a Sanity GROQ query — the
// signature and the Review contract stay identical, so no caller changes.
//
// Bryan: "Make sure that the most recent review is always at the top."
export async function getReviews(): Promise<Review[]> {
  return [...fixtureReviews].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}
```

- [ ] **Step 8: Build and view**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

Run: `npm run dev`, open `http://localhost:3000/`
Expected: warm paper background, the wordmark and `Reviews · Archive · About · Submit` nav, the strap, then three reviews newest-first, each with a full-width image, an aligned caption, a headline, an ink-blue linked dateline, and the essay. The third review (`the-face-in-the-glass`, no `showUrl`) shows an **unlinked** dateline. Only `van-gogh-in-arles` shows a tagline.

- [ ] **Step 9: Commit**

```bash
git add components/site app/page.tsx lib/reviews-source.ts
git commit -m "Add the finalized site chrome and the Reviews feed at /"
```

---

### Task 5: Archive at /archive — search + inline expand

Carries over Folio's proven pattern (`themes/folio/archive-list.tsx`): a compact ruled index, fuzzy search, and a CSS grid-rows accordion. Rewritten against the new model. Search is the archive's reason to exist — find a review without the raw scroll.

**Files:**
- Create: `app/archive/page.tsx`
- Create: `components/site/ArchiveList.tsx`
- Modify: `components/site/site.module.css` (append the archive block)

**Interfaces:**
- Consumes: `Review` from `@/content/review`; `getReviews` from `@/lib/reviews-source`; `formatRange`; `Body`, `Dateline`, `Header`.
- Produces: `<ArchiveList reviews={...} />`.

- [ ] **Step 1: Append the archive styles**

Append to `components/site/site.module.css`:

```css
/* ---------- archive ---------- */
.archive {
  max-width: 1000px;
  margin: 0 auto;
  padding: 84px 56px 0;
}
.arcTitle {
  font-family: var(--f-fraunces);
  font-optical-sizing: auto;
  font-weight: 760;
  font-size: clamp(34px, 4.6vw, 56px);
  line-height: 1.06;
  letter-spacing: -0.018em;
  margin: 0 0 28px;
}
.arcSearch {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--ink);
  padding: 0 0 10px;
}
.arcSearchGlyph { color: var(--ink2); flex: none; }
.arcSearchInput {
  flex: 1;
  border: 0;
  background: transparent;
  font-family: var(--f-newsreader);
  font-size: 19px;
  color: var(--ink);
  padding: 4px 0;
}
.arcSearchInput::placeholder { color: var(--ink2); }
.arcSearchInput:focus { outline: none; }
.arcSearch:focus-within { border-bottom-color: var(--blue); }

.arcStatus {
  font-family: var(--f-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink2);
  min-height: 1.4em;
  margin: 12px 0 0;
}
.arcEmpty {
  font-family: var(--f-mono);
  font-size: 12px;
  color: var(--ink2);
  padding: 28px 0;
}

.arcRows { border-top: 1px solid var(--rule); }
.arcRow { border-bottom: 1px solid var(--rule); }
.arcSummary {
  width: 100%;
  display: grid;
  grid-template-columns: 64px 1fr auto;
  align-items: center;
  gap: 18px;
  padding: 16px 0;
  background: none;
  border: 0;
  text-align: left;
  cursor: pointer;
  color: inherit;
  font: inherit;
}
.arcSummary:hover .arcRowTitle { color: var(--blue); }
.arcPlate {
  position: relative;
  width: 64px;
  height: 48px;
  overflow: hidden;
  background: #e9e5d8;
}
.arcPlateImg { object-fit: cover; }
.arcRowTitle {
  display: block;
  font-family: var(--f-fraunces);
  font-weight: 700;
  font-size: 20px;
  line-height: 1.2;
}
.arcRowMeta {
  display: block;
  margin-top: 3px;
  font-family: var(--f-mono);
  font-size: 11px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--ink2);
}
.arcCue {
  font-family: var(--f-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink2);
}
.hl { background: color-mix(in srgb, var(--blue) 16%, transparent); color: inherit; }

/* Accordion: grid-rows 0fr -> 1fr. No view transition — it fought the scroll. */
.arcPanelClip {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 260ms ease;
}
.arcRow[data-open] .arcPanelClip { grid-template-rows: 1fr; }
.arcPanelInner { overflow: hidden; }
.arcPanel { padding: 4px 0 32px; }
.arcFigure { margin: 0 0 16px; max-width: 560px; }
.arcExpandImg { width: 100%; height: auto; display: block; background: #e9e5d8; }

@media (prefers-reduced-motion: reduce) {
  .arcPanelClip { transition: none; }
}

@media (max-width: 820px) {
  .archive { padding-left: 22px; padding-right: 22px; }
  .arcSummary { grid-template-columns: 48px 1fr; gap: 12px; }
  .arcPlate { width: 48px; height: 40px; }
  .arcCue { display: none; }
}
```

- [ ] **Step 2: Create the ArchiveList client component**

Create `components/site/ArchiveList.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Fuse, { type FuseResultMatch, type RangeTuple } from "fuse.js";
import type { PortableTextBlock } from "@portabletext/types";
import type { Review } from "@/content/review";
import { formatRange } from "@/lib/format-date";
import { Body } from "./Body";
import { Dateline } from "./Dateline";
import styles from "./site.module.css";

// The archive exists to find a review without the raw scroll, so search is the
// point. Rows expand inline (there are no review pages).

type MatchMap = Record<string, ReadonlyArray<RangeTuple>>;
type Entry = { r: Review; matches: MatchMap };
type Searchable = Review & { bodyText: string };

// Keys map to the new model. headline dominates; body barely registers.
const FUSE_KEYS = [
  { name: "headline", weight: 0.5 },
  { name: "showName", weight: 0.28 },
  { name: "tagline", weight: 0.12 },
  { name: "bodyText", weight: 0.1 },
];

// Flatten Portable Text to plain text so Fuse can weigh the prose.
function toPlainText(blocks: PortableTextBlock[]): string {
  return (blocks ?? [])
    .map((b) => {
      const block = b as unknown as { _type?: string; children?: Array<{ text?: string }> };
      if (block._type !== "block" || !Array.isArray(block.children)) return "";
      return block.children.map((c) => c.text ?? "").join("");
    })
    .join(" ")
    .trim();
}

// Wrap Fuse's matched ranges in <mark>.
function highlight(text: string, ranges?: ReadonlyArray<RangeTuple>): React.ReactNode {
  if (!ranges || ranges.length === 0) return text;
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const out: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach(([start, end], i) => {
    const s = Math.max(start, cursor);
    const e = end + 1; // Fuse ranges are inclusive
    if (e <= s) return;
    if (s > cursor) out.push(text.slice(cursor, s));
    out.push(<mark key={i} className={styles.hl}>{text.slice(s, e)}</mark>);
    cursor = e;
  });
  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export default function ArchiveList({ reviews }: { reviews: Review[] }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 120);
    return () => clearTimeout(id);
  }, [query]);

  const searching = debounced.trim().length > 0;

  const searchable = useMemo<Searchable[]>(
    () => reviews.map((r) => ({ ...r, bodyText: toPlainText(r.body) })),
    [reviews],
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchable, {
        keys: FUSE_KEYS,
        includeMatches: true,
        ignoreLocation: true,
        threshold: 0.38,
        minMatchCharLength: 2,
      }),
    [searchable],
  );

  const list = useMemo<Entry[]>(() => {
    const q = debounced.trim();
    if (!q) return reviews.map((r) => ({ r, matches: {} }));
    return fuse.search(q).map((res) => {
      const matches: MatchMap = {};
      for (const m of (res.matches ?? []) as ReadonlyArray<FuseResultMatch>) {
        if (m.key && !(m.key in matches)) matches[m.key] = m.indices;
      }
      return { r: res.item as Review, matches };
    });
  }, [debounced, fuse, reviews]);

  return (
    <>
      <div className={styles.arcSearch} role="search">
        <svg className={styles.arcSearchGlyph} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          className={styles.arcSearchInput}
          type="search"
          placeholder="Search reviews"
          aria-label="Search reviews"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <p className={styles.arcStatus} role="status" aria-live="polite">
        {searching ? `${list.length} of ${reviews.length}` : " "}
      </p>

      {list.length === 0 ? (
        <p className={styles.arcEmpty}>No reviews match that search.</p>
      ) : (
        <div className={styles.arcRows}>
          {list.map(({ r, matches }) => {
            const isOpen = openSlug === r.slug;
            const panelId = `arc-panel-${r.slug}`;
            const range = formatRange(r.startDate, r.endDate);
            return (
              <div key={r.slug} className={styles.arcRow} data-open={isOpen ? "" : undefined}>
                <button
                  type="button"
                  className={styles.arcSummary}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenSlug((cur) => (cur === r.slug ? null : r.slug))}
                >
                  <span className={styles.arcPlate}>
                    {!isOpen && r.image.url && (
                      <Image className={styles.arcPlateImg} src={r.image.url} alt="" fill sizes="64px" />
                    )}
                  </span>
                  <span>
                    <span className={styles.arcRowTitle}>{highlight(r.headline, matches.headline)}</span>
                    <span className={styles.arcRowMeta}>
                      {highlight(r.showName, matches.showName)}
                      {range ? `, ${range}` : ""}
                    </span>
                  </span>
                  <span className={styles.arcCue} aria-hidden="true">{isOpen ? "Close" : "Read"}</span>
                </button>

                <div className={styles.arcPanelClip} id={panelId} inert={!isOpen}>
                  <div className={styles.arcPanelInner}>
                    <div className={styles.arcPanel}>
                      {r.image.url && (
                        <figure className={styles.arcFigure}>
                          <Image
                            className={styles.arcExpandImg}
                            src={r.image.url}
                            alt={r.image.alt}
                            width={r.image.width}
                            height={r.image.height}
                            sizes="(max-width: 820px) 100vw, 560px"
                          />
                          {r.image.caption && (
                            <figcaption className={styles.caption}>{r.image.caption}</figcaption>
                          )}
                        </figure>
                      )}
                      <Dateline review={r} />
                      {r.tagline?.trim() ? <p className={styles.tagline}>{r.tagline}</p> : null}
                      <Body value={r.body} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Create the archive route**

Create `app/archive/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import ArchiveList from "@/components/site/ArchiveList";
import { getReviews } from "@/lib/reviews-source";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "Archive — The Broadway Art Ledger" };

export default async function ArchivePage() {
  const reviews = await getReviews();

  return (
    <main className={styles.root}>
      <Header active="Archive" />
      <section className={styles.archive}>
        <h1 className={styles.arcTitle}>Archive</h1>
        <ArchiveList reviews={reviews} />
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Build and verify**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

Run: `npm run dev`, open `http://localhost:3000/archive`
Expected: three ruled rows with thumbnails. Typing "van gogh" narrows to matching rows with highlighted matches and shows a count. Typing "zzzz" shows "No reviews match that search." Clicking a row expands the full review inline; clicking again collapses it; opening another closes the first.

- [ ] **Step 5: Commit**

```bash
git add app/archive components/site
git commit -m "Add the Archive: search and inline expand, no review pages"
```

---

### Task 6: About and Submit pages

**Files:**
- Create: `app/about/page.tsx`
- Create: `app/submit/page.tsx`

**Interfaces:**
- Consumes: `aboutStatement`, `submitGuide`, `SUBMIT_FORM_URL`, `CONTACT_EMAIL` from `@/content/site`; `Header`; `styles`.
- Produces: nothing consumed downstream.

- [ ] **Step 1: Create the About page**

Bryan explicitly asked for his image here. Substitute the real width/height recorded in Task 3, Step 3.

Create `app/about/page.tsx`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/site/Header";
import { aboutStatement } from "@/content/site";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "About — The Broadway Art Ledger" };

export default function AboutPage() {
  return (
    <main className={styles.root}>
      <Header active="About" />
      <div className={styles.reader}>
        {/* Bryan asked for this image on the About page. */}
        <figure className={styles.aboutFig}>
          <Image
            className={styles.aboutImg}
            src="/about.png"
            alt=""
            width={ABOUT_W}
            height={ABOUT_H}
            sizes="(max-width: 820px) 100vw, 888px"
            priority
          />
        </figure>
        <h1 className={styles.readerTitle}>{aboutStatement.title}</h1>
        <div className={styles.readerBody}>
          {aboutStatement.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </main>
  );
}
```

Replace `ABOUT_W` / `ABOUT_H` with the integers printed in Task 3, Step 3.

- [ ] **Step 2: Create the Submit page**

This epic does **not** build our own form — `/submit` is Bryan's copy plus a link to his Airtable form.

Create `app/submit/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Header } from "@/components/site/Header";
import { submitGuide, SUBMIT_FORM_URL, CONTACT_EMAIL } from "@/content/site";
import styles from "@/components/site/site.module.css";

export const metadata: Metadata = { title: "Submit — The Broadway Art Ledger" };

export default function SubmitPage() {
  return (
    <main className={styles.root}>
      <Header active="Submit" />
      <div className={styles.reader}>
        <h1 className={styles.readerTitle}>{submitGuide.pitchGuideTitle}</h1>

        <div className={styles.readerBody}>
          {submitGuide.intro.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        {/* Outbound handoff to Bryan's own Airtable form. New tab: it's a
            different product, and a writer shouldn't hit a dead end. */}
        <a
          className={styles.formLink}
          href={SUBMIT_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open the pitch form
        </a>

        <h2 className={styles.subhead}>{submitGuide.guidelinesTitle}</h2>
        <p className={styles.subheadNote}>{submitGuide.guidelinesIntro}</p>
        <ul className={styles.guidelines}>
          {submitGuide.guidelines.map((g, i) => (
            <li key={i}>
              {g}
              {/* Bryan hyperlinks the International Art English essay from the
                  jargon guideline. */}
              {g.startsWith("Avoid making your piece read like a press release") && (
                <>
                  {" "}
                  (
                  <a href={submitGuide.jargonEssayUrl} target="_blank" rel="noopener noreferrer">
                    This essay
                  </a>{" "}
                  on International Art English is a great reference point.)
                </>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.readerBody}>
          <p>
            {submitGuide.outro}{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
            for any other questions or suggestions. We are always looking for ways to improve.
          </p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Build and verify**

Run: `npx tsc --noEmit && npm run build`
Expected: build succeeds.

Run: `npm run dev`; open `/about` and `/submit`.
Expected: About shows Bryan's image above his four paragraphs, ending "…Because King Kong died here, and it's where the best art lives." Submit shows the pitch guide, a blue "Open the pitch form" button linking to Airtable in a new tab, the 11 guidelines with the essay link on the jargon bullet, and the contact email. Neither page has a footer.

- [ ] **Step 4: Commit**

```bash
git add app/about app/submit
git commit -m "Add About (with Bryan's image) and Submit (copy + link to his form)"
```

---

### Task 7: Verify the whole site and clean up

**Files:**
- Modify: `app/layout.tsx` (metadata description → Bryan's strap)
- Create: `scripts/shoot.mts` (screenshot helper, throwaway)

- [ ] **Step 1: Align the root metadata with Bryan's copy**

In `app/layout.tsx`, the description is our old paraphrase. Replace it with Bryan's strap:

```tsx
import { strap } from "@/content/site";

export const metadata: Metadata = {
  title: "The Broadway Art Ledger",
  description: strap,
};
```

- [ ] **Step 2: Confirm no real-site file imports the Mark or legacy model**

Run: `grep -rn "components/Mark\|content/reviews\"" app/page.tsx app/archive app/about app/submit components/site lib/reviews-source.ts`
Expected: **no output**.

- [ ] **Step 3: Confirm the exploration still works**

Run: `npm run dev` and visit `/designs`, `/designs/archive`, `/t/kunsthalle`, `/t/folio`, `/lab`.
Expected: all render from the static seed, unchanged. This is the freeze paying off.

- [ ] **Step 4: Screenshot the four surfaces**

Create `scripts/shoot.mts`:

```ts
// Throwaway: screenshot the four surfaces for review. Delete when done.
import { chromium } from "playwright";

const pages: Array<[string, string]> = [
  ["/", "reviews"],
  ["/archive", "archive"],
  ["/about", "about"],
  ["/submit", "submit"],
];

const browser = await chromium.launch();
for (const [path, name] of pages) {
  for (const [w, h, tag] of [[1280, 900, "desktop"], [390, 844, "mobile"]] as const) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(`http://localhost:3000${path}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `.shots/${name}-${tag}.png`, fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log("shots written to .shots/");
```

With `npm run dev` running: `npx tsx scripts/shoot.mts`
Review the images. Check: captions align to image edges, headline is not oversized, dateline is ink-blue and linked, no footer, mobile has no horizontal scroll.

- [ ] **Step 5: Full build gate**

Run: `npm test && npx tsc --noEmit && npm run build && npm run lint`
Expected: 6 tests pass, no type errors, build succeeds, lint clean.

- [ ] **Step 6: Commit**

```bash
rm -rf .shots scripts/shoot.mts
git add -A
git commit -m "Align root metadata with Bryan's copy; verify all four surfaces"
```

---

## Self-Review

**Spec coverage:**
- Phase 0 (model + freeze) → Tasks 1, 2 ✓
- Phase 1 (design, four surfaces, exploration → /designs) → Tasks 2, 4, 5, 6 ✓
- Phase 3 (Submit = copy + link) → Task 6 ✓
- Phase 4 (copy + About image) → Tasks 3, 6 ✓
- Phase 2 (Sanity) → **Plan 2, deliberately out of scope**
- Phase 5 (cutover/domain) → Plan 2 / deferred
- Bryan's 8 tweaks: no № (model omits it) ✓; smaller headline (Task 4 clamp) ✓; no tagline by default (renders iff non-empty) ✓; linked dateline ✓; nav Reviews·Archive·About·Submit ✓; newest first (`getReviews` sort) ✓; About/Submit clean ✓; captions align (figcaption in figure) ✓

**Type consistency:** `Review`/`ReviewImage` defined Task 1, used Tasks 4–6. `formatRange(start, end)` defined Task 1, used in `Dateline` and `ArchiveList`. `getReviews(): Promise<Review[]>` defined Task 4 Step 7, consumed by `/`, `/archive`. `Body`/`Dateline`/`Header` signatures match every call site. Fuse keys (`headline`/`showName`/`tagline`/`bodyText`) all exist on `Searchable`.

**Known follow-ups for Plan 2:** `lib/reviews-data.ts` (the old Airtable read) is now unused by the real site and still referenced by nothing after Task 2 — Plan 2 replaces it with the Sanity source and deletes `/api/photo`.
