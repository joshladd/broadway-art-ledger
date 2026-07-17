import { defineField, defineType } from "sanity";

// Mirrors the live `Review` contract in content/review.ts field-for-field.
// Sanity conforms to the contract, not the reverse.
//
// What is deliberately ABSENT: an issue number, a byline, a venue/neighborhood,
// artist/artwork, and a separate photo credit. Bryan never asked for them; they
// are parked in docs/IDEAS.md. Descriptions are written for Bryan, in the
// editor — plain and functional.
export const review = defineType({
  name: "review",
  title: "Review",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      type: "string",
      description: "The review's own title.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Generated from the headline. Used internally, not as a web address.",
      options: { source: "headline", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "showName",
      title: "Show / institution",
      type: "string",
      description:
        'Appears before the run dates, e.g. "Alex Berns" in "Alex Berns, May 15–June 13, 2026".',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "startDate",
      title: "Run starts",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
    }),
    defineField({
      name: "endDate",
      title: "Run ends",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
    }),
    defineField({
      name: "showUrl",
      title: "Show link",
      type: "url",
      description:
        "The show line links here. Leave it blank and the line stays plain text.",
    }),
    defineField({
      name: "tagline",
      title: "Tagline (optional)",
      type: "text",
      rows: 2,
      description:
        "Leave blank for no teaser — blank is the default. Write one and it appears above the review.",
    }),
    defineField({
      name: "heroImage",
      title: "Marquee image",
      type: "image",
      description: "One image per review.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "caption",
          title: "Caption",
          type: "text",
          rows: 2,
          description: "Shown beneath the image, aligned to its edges.",
        }),
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description:
            "Describes the image for screen readers. Never shown on the page.",
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
      description: "The review itself. Paste it in; links and italics work.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      description: "Orders the feed — the most recent review sits at the top.",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "headline", subtitle: "showName", media: "heroImage" },
  },
});
