import { config, collection, fields } from "@keystatic/core";

// Use GitHub storage only when the GitHub App keys are present (i.e. on the
// deployed site once you set the env vars). Otherwise fall back to local files,
// so `npm run dev` and CI builds work with zero configuration.
const storage = process.env.KEYSTATIC_GITHUB_CLIENT_ID
  ? ({ kind: "github", repo: { owner: "joshladd", name: "broadway-art-ledger" } } as const)
  : ({ kind: "local" } as const);

export default config({
  storage,
  ui: { brand: { name: "The Broadway Art Ledger" } },
  collections: {
    reviews: collection({
      label: "Reviews",
      path: "content/reviews/*",
      slugField: "title",
      format: { data: "yaml" },
      columns: ["title", "date"],
      schema: {
        title: fields.slug({ name: { label: "Show / gallery title" } }),
        no: fields.text({ label: "Entry number", defaultValue: "№ 000" }),
        date: fields.date({ label: "Date" }),
        section: fields.select({
          label: "Section",
          options: [
            { label: "Painting", value: "Painting" },
            { label: "Sculpture", value: "Sculpture" },
            { label: "Photography", value: "Photography" },
            { label: "Prints", value: "Prints" },
            { label: "Installation", value: "Installation" },
            { label: "Old Masters", value: "Old Masters" },
            { label: "Portraiture", value: "Portraiture" },
            { label: "Group Show", value: "Group Show" },
          ],
          defaultValue: "Painting",
        }),
        venue: fields.text({ label: "Venue" }),
        hood: fields.text({ label: "Neighborhood" }),
        by: fields.text({ label: "Author (byline)" }),
        dek: fields.text({ label: "Dek — one-line summary" }),
        image: fields.image({
          label: "Marquee image",
          directory: "public/art",
          publicPath: "/art/",
        }),
        artist: fields.text({ label: "Artist" }),
        artwork: fields.text({ label: "Artwork title" }),
        credit: fields.text({ label: "Image credit line" }),
        alt: fields.text({ label: "Image alt text" }),
        body: fields.text({
          label: "Review — separate paragraphs with a blank line",
          multiline: true,
        }),
      },
    }),
  },
});
