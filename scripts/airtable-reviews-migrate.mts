// Create a "Reviews" table (if missing) and populate it from content/reviews.ts.
// Run: node --env-file=.env.local --import tsx scripts/airtable-reviews-migrate.mts
import { reviews } from "../content/reviews";

const token = process.env.AIRTABLE_TOKEN;
const base = process.env.AIRTABLE_BASE_ID;
if (!token || !base) { console.error("✗ Missing AIRTABLE_TOKEN / AIRTABLE_BASE_ID"); process.exit(1); }
const H = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

const sectionChoices = ["Painting", "Sculpture", "Photography", "Prints", "Installation", "Old Masters", "Portraiture", "Group Show", "Other"].map((name) => ({ name }));

const fields = [
  { name: "Title", type: "singleLineText" },
  { name: "No", type: "singleLineText" },
  { name: "Date", type: "date", options: { dateFormat: { name: "iso" } } },
  { name: "Section", type: "singleSelect", options: { choices: sectionChoices } },
  { name: "Venue", type: "singleLineText" },
  { name: "Hood", type: "singleLineText" },
  { name: "Byline", type: "singleLineText" },
  { name: "Dek", type: "singleLineText" },
  { name: "Body", type: "multilineText" },
  { name: "Image", type: "singleLineText" },
  { name: "Artist", type: "singleLineText" },
  { name: "Artwork", type: "singleLineText" },
  { name: "Credit", type: "singleLineText" },
  { name: "Alt", type: "multilineText" },
  { name: "Published", type: "checkbox", options: { icon: "check", color: "greenBright" } },
];

// find or create the Reviews table
const meta = await fetch(`https://api.airtable.com/v0/meta/bases/${base}/tables`, { headers: H }).then((r) => r.json());
let table = meta.tables?.find((t: any) => t.name === "Reviews");
if (table) {
  console.log("▸ Reviews table already exists:", table.id);
} else {
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${base}/tables`, { method: "POST", headers: H, body: JSON.stringify({ name: "Reviews", fields }) });
  if (!res.ok) {
    console.error(`✗ Could not create the table (${res.status}):`, await res.text());
    console.error("  If this is a permissions error, add the 'schema.bases:write' scope to your PAT and re-run,");
    console.error("  or make a table called 'Reviews' with these fields:", fields.map((f) => f.name).join(", "));
    process.exit(2);
  }
  table = await res.json();
  console.log("▸ Created Reviews table:", table.id);
}

// don't duplicate on re-run
const existing = await fetch(`https://api.airtable.com/v0/${base}/${table.id}?maxRecords=1`, { headers: H }).then((r) => r.json());
if (existing.records?.length) {
  console.log("▸ Table already has records — skipping insert (delete them in Airtable to re-migrate).");
  process.exit(0);
}

const records = reviews.map((r) => ({
  fields: {
    Title: r.title, No: r.no, Date: r.iso, Section: r.section, Venue: r.venue, Hood: r.hood,
    Byline: r.by, Dek: r.dek, Body: r.body.join("\n\n"), Image: r.image, Artist: r.artist,
    Artwork: r.artwork, Credit: r.credit, Alt: r.alt, Published: true,
  },
}));
for (let i = 0; i < records.length; i += 10) {
  const batch = records.slice(i, i + 10);
  const res = await fetch(`https://api.airtable.com/v0/${base}/${table.id}`, { method: "POST", headers: H, body: JSON.stringify({ records: batch, typecast: true }) });
  if (!res.ok) { console.error("✗ Insert failed:", res.status, await res.text()); process.exit(3); }
  console.log("  inserted", batch.length);
}
console.log("✓ done:", records.length, "reviews");
