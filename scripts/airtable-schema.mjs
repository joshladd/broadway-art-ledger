// Print the base's tables + fields so we can map the pitch form exactly.
// Run: node --env-file=.env.local scripts/airtable-schema.mjs
const token = process.env.AIRTABLE_TOKEN;
const baseId = process.env.AIRTABLE_BASE_ID;

if (!token) { console.error("✗ AIRTABLE_TOKEN is empty — paste your PAT into .env.local first."); process.exit(1); }
if (!baseId) { console.error("✗ AIRTABLE_BASE_ID is missing in .env.local."); process.exit(1); }

const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
  headers: { Authorization: `Bearer ${token}` },
});

if (!res.ok) {
  console.error(`✗ Airtable API error ${res.status}:`, await res.text());
  console.error("  (check the token scope/base access — the token itself is never printed)");
  process.exit(2);
}

const { tables } = await res.json();
for (const t of tables) {
  console.log(`\n▸ ${t.name}   (${t.id})`);
  for (const f of t.fields) {
    const choices = f.options?.choices?.map((c) => c.name).join(", ");
    console.log(`    • ${f.name}  —  ${f.type}${choices ? `  [${choices}]` : ""}`);
  }
}
console.log("\n✓ schema read OK");
