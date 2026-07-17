import { defineField, defineType } from "sanity";

// Singleton for the About page copy. The image on that page is fixed in the
// design and isn't edited here. Body is normal rich text — paste paragraphs,
// italicize, add links.
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      description: "The big heading at the top of the About page.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
      description: "The About statement. Links and italics work.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "About page" }),
  },
});
