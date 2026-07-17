import { defineField, defineType } from "sanity";

// Singleton for the Submit page. The page is copy above a button, then a nested
// guidelines section, then a contact line below — so it's split into named
// regions rather than one field. Each region renders in a fixed slot, so the
// layout stays put and only the words change.
export const submitPage = defineType({
  name: "submitPage",
  title: "Submit page",
  type: "document",
  fields: [
    defineField({
      name: "pitchGuideTitle",
      title: "Heading",
      type: "string",
      description: "The big heading at the top of the Submit page.",
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "array",
      of: [{ type: "block" }],
      description: "The paragraphs above the guidelines. Links and italics work.",
    }),
    defineField({
      name: "guidelinesTitle",
      title: "Guidelines heading",
      type: "string",
      description: 'The subheading for the guidelines section (e.g. "Review Guidelines").',
    }),
    defineField({
      name: "guidelinesIntro",
      title: "Guidelines note",
      type: "string",
      description: "The small line under the guidelines heading.",
    }),
    defineField({
      name: "guidelines",
      title: "Guidelines",
      type: "array",
      of: [{ type: "block" }],
      description: "The bulleted list of requirements. Use the bullet-list button.",
    }),
    defineField({
      name: "formUrl",
      title: "Pitch form link",
      type: "url",
      description: "Where the 'Open the pitch form' button goes.",
    }),
    defineField({
      name: "outro",
      title: "Contact line",
      type: "array",
      of: [{ type: "block" }],
      description: "The paragraph below the button. Links and italics work.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Submit page" }),
  },
});
