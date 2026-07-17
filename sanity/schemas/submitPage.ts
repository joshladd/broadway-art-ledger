import { defineField, defineType } from "sanity";

// Singleton for the Submit page. One rich-text body owns the whole guide —
// headings, paragraphs, bullets — so the layout is Bryan's to shape. Two small
// fields sit around it: where the form button goes, and the little blurb under
// it.
export const submitPage = defineType({
  name: "submitPage",
  title: "Submit page",
  type: "document",
  fields: [
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
      description:
        "The whole guide. Use headings, paragraphs, and bullet lists. Links and italics work.",
    }),
    defineField({
      name: "formUrl",
      title: "Pitch form link",
      type: "url",
      description: "Where the 'Open the pitch form' button goes. It sits below the body.",
    }),
    defineField({
      name: "blurb",
      title: "Blurb (below the button)",
      type: "array",
      of: [{ type: "block" }],
      description: "The small line under the button — e.g. the contact address.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Submit page" }),
  },
});
