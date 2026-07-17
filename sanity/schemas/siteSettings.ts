import { defineField, defineType } from "sanity";

// A singleton: exactly one of these exists. It holds the small bits of chrome
// copy that aren't tied to a single page — today just the tagline under the
// masthead. The Studio pins it (see sanity/structure.ts) so there is only ever
// one to edit, never a list to add to.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "strap",
      title: "Tagline",
      type: "string",
      description:
        "The line under the title on every page. Leave blank to fall back to the built-in tagline.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site settings" }),
  },
});
