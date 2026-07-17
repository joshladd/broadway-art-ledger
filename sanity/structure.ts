import type { StructureResolver } from "sanity/structure";

// The Studio's left-hand list. Two goals:
//   1. Reviews stay a normal collection Bryan adds to.
//   2. The three copy singletons show as single, always-there entries — no
//      "create new", no list — so editing site copy feels like opening a page,
//      not managing documents.
const SINGLETONS = [
  { id: "siteSettings", title: "Site settings", schema: "siteSettings" },
  { id: "aboutPage", title: "About page", schema: "aboutPage" },
  { id: "submitPage", title: "Submit page", schema: "submitPage" },
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("review").title("Reviews"),
      S.divider(),
      ...SINGLETONS.map(({ id, title, schema }) =>
        S.listItem()
          .title(title)
          .id(id)
          .child(S.document().schemaType(schema).documentId(id)),
      ),
    ]);
