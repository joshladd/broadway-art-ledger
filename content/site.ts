// Bryan's copy, verbatim — the FALLBACK for the editable Sanity singletons
// (siteSettings / aboutPage / submitPage). Bryan now controls this copy in the
// Studio; lib/site-content.ts reads the singletons and falls back to these
// values per-field, so nothing renders blank before they're seeded, and a
// fresh clone looks correct with no CMS content at all.
//
// The rule for this site: only copy Bryan wrote reaches the surface. Do not
// paraphrase, trim, or "improve" any string in this file. Functional microcopy
// (buttons, empty states, search placeholder) is ours and lives at its use site.
//
// The publication's name is italicized wherever it appears in running prose
// (CMOS for a publication title). `PUBLICATION` is exported so the About
// renderer can reproduce that emphasis rather than flattening it.

export const wordmark = "The Broadway Art Ledger";
export const PUBLICATION = "The Broadway Art Ledger";

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
// visitor in an incognito window. Not a secret — a public share link.
export const SUBMIT_FORM_URL =
  "https://airtable.com/appi8Pjrcq4G6Lz8p/shrEAVG242D5A34Hk";

export const CONTACT_EMAIL = "thebroadwayartledger@gmail.com";

// The essay Bryan hyperlinks from the jargon guideline.
export const JARGON_ESSAY_URL =
  "https://canopycanopycanopy.com/contents/international_art_english";

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
    // The parenthetical essay link is rendered separately so it can be a real
    // hyperlink — Bryan links it in his source.
    "Avoid making your piece read like a press release, and avoid jargon.",
    "We follow CMOS, so ideally write your first draft in that style to the best of your ability.",
    "We do not have the capacity for endnotes at this time. Please hyperlink online sources where possible and otherwise identify your sources.",
    "If we suspect AI-generated writing or plagiarism, we will not move forward with your piece.",
    "If your piece is accepted, please alert us of any potential conflicts of interest. While this does not automatically disqualify you, we will not move forward with pieces that have serious conflicts of interest.",
  ],
  outro: {
    before:
      "Did we miss something? Have any advice on how to improve our process? While we will not give you the status of your submission, please email us at",
    after: "for any other questions or suggestions. We are always looking for ways to improve.",
  },
};
