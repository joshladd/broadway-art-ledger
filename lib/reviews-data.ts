import type { Review } from "@/content/reviews";

// Reviews come from the Airtable "Reviews" table. next:{revalidate} means the
// fetch runs at build (pages are SSG) and refreshes every 60s — Bryan's edits go
// live within a minute, no redeploy, pages stay fast.
const TOKEN = process.env.AIRTABLE_TOKEN;
const BASE = process.env.AIRTABLE_BASE_ID;
const TABLE = "Reviews";
const REVALIDATE = 60;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function displayDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[2]}.${m[3]}.${m[1].slice(2)}` : iso;
}
function normImage(img: string): string {
  if (!img) return "";
  return img.startsWith("/") || img.startsWith("http") ? img : `/art/${img}`;
}

export async function getReviews(): Promise<Review[]> {
  if (!TOKEN || !BASE) {
    console.warn("getReviews: AIRTABLE_TOKEN / AIRTABLE_BASE_ID not set — no reviews.");
    return [];
  }
  const out: Review[] = [];
  let offset: string | undefined;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE}/${TABLE}`);
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("filterByFormula", "{Published}=1");
    url.searchParams.set("sort[0][field]", "Date");
    url.searchParams.set("sort[0][direction]", "desc");
    if (offset) url.searchParams.set("offset", offset);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${TOKEN}` },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) {
      console.error("getReviews: Airtable fetch failed", res.status, await res.text());
      break;
    }
    const data = await res.json();
    for (const rec of data.records as Array<{ id: string; fields: Record<string, unknown> }>) {
      const f = rec.fields || {};
      const iso = str(f["Date"]);
      // Uploaded photo (attachment) wins; served via our stable proxy. Else the
      // text Image path (the repo /art samples).
      const photo = Array.isArray(f["Photo"]) && f["Photo"].length > 0;
      out.push({
        slug: rec.id,
        no: str(f["No"]),
        date: displayDate(iso),
        iso,
        section: str(f["Section"]),
        title: str(f["Title"]),
        venue: str(f["Venue"]),
        hood: str(f["Hood"]),
        by: str(f["Byline"]),
        dek: str(f["Dek"]),
        body: str(f["Body"]).split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
        image: photo ? `/api/photo/${rec.id}` : normImage(str(f["Image"])),
        artist: str(f["Artist"]),
        artwork: str(f["Artwork"]),
        credit: str(f["Credit"]),
        alt: str(f["Alt"]) || str(f["Title"]),
      });
    }
    offset = data.offset;
  } while (offset);
  return out;
}
