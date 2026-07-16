// One-time: write the existing reviews array out as Keystatic content files.
// Run: npx tsx scripts/migrate-to-keystatic.mts
import { reviews } from "../content/reviews";
import { stringify } from "yaml";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const outDir = path.join(process.cwd(), "content", "reviews");
mkdirSync(outDir, { recursive: true });

for (const r of reviews) {
  const data = {
    title: r.title,
    no: r.no,
    date: r.iso, // fields.date wants ISO
    section: r.section,
    venue: r.venue,
    hood: r.hood,
    by: r.by,
    dek: r.dek,
    image: r.image.replace(/^\/art\//, ""), // fields.image stores the filename
    artist: r.artist,
    artwork: r.artwork,
    credit: r.credit,
    alt: r.alt,
    body: r.body.join("\n\n"),
  };
  writeFileSync(path.join(outDir, `${r.slug}.yaml`), stringify(data), "utf8");
  console.log("wrote", `${r.slug}.yaml`);
}
console.log("done:", reviews.length, "reviews");
