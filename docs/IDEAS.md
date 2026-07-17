# Parking Lot — ideas not (yet) on the app surface

Rule for this project: **the rendered app shows only what Bryan has explicitly
asked for.** Ideas we think might be cool live here until Bryan calls them in.
Nothing in this file is built unless it graduates to the spec with Bryan's
sign-off.

---

## Byline / writer credit
- **Idea:** show the writer's byline ("By …") on published reviews. Standard for
  criticism; writers are edited over several drafts, paid $200, and are real
  credited authors. The project's anonymity is specific — *pitches* are blind and
  the *editorial side* (Bryan) stays anonymous — which doesn't inherently hide the
  *writer*.
- **Status:** not called out by Bryan → **off the app surface for now.** Kept in
  the data model only if/when he wants it. Logged here so we don't lose the
  thread.
- **Open sub-questions if it graduates:** byline placement (under headline vs.
  end of piece), and whether the author also gets a photo credit line.

## Photo credit line (separate from caption)
- **Idea:** a distinct credit line under the image (e.g. "Photo by the author"),
  separate from the writer-provided caption.
- **Status:** Bryan called out the **caption** only ("provide the caption",
  "captions align with images"). No separate credit field on the surface for now;
  a writer can fold credit into the caption if they want.

## The two-squares Mark (house logo)
- **Idea:** the offset two-squares vermilion mark (`components/Mark.tsx`) as a
  house identity — in the masthead between "Art" and "Ledger", in the footer, and
  as the mobile nav logo. Built and refined during Folio.
- **Status:** **cut from the finalized design.** Bryan never called it out;
  Kunsthalle (the design he called "perfect") is wordmark-only; and vermilion
  would fight Broadside's ink-blue accent, which is the palette's single
  chromatic note.
- **If it ever returns:** it would need recoloring to sit inside the ink-blue
  palette, which makes it a different mark than the vermilion one.

## Invented chrome copy (footer "facts" list)
- **Idea:** the three-fact footer strip ("Blind, anonymous pitches" / "One marquee
  image per review" / "Published authors paid a $200 flat fee").
- **Status:** cut — this is *our paraphrase* of Bryan's guidelines, not his copy.
  The surface carries only copy Bryan wrote.

## Current / Archive nav split
- **Idea:** split the nav into "Current" and "Archive" as volume grows (Bryan's
  own stated future direction). Launch nav is just **Reviews**.
- **Status:** deferred by Bryan explicitly ("shift to Current and Archive in the
  future").

## Search / fuzzy archive
- **Idea:** the Folio fuzzy-search archive (fuse.js) for browsing back-catalog.
- **Status:** parked until volume warrants; not requested for launch.
