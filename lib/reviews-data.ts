import type { Review } from "@/content/reviews";

// Reviews come from the Airtable "Reviews" table. next:{revalidate} means the
// fetch runs at build (pages are SSG) and refreshes every 60s — Bryan's edits go
// live within a minute, no redeploy, pages stay fast.
const TOKEN = process.env.AIRTABLE_TOKEN;
const BASE = process.env.AIRTABLE_BASE_ID;
const TABLE = "Reviews";
// How long a cached reviews fetch is served before it revalidates in the
// background (ISR). Edits in Airtable appear within this window with NO rebuild
// or redeploy. Lower = fresher/more "realtime"; higher = fewer Airtable calls.
// (For truly instant updates, add on-demand revalidation — see /api/revalidate.)
const REVALIDATE = 15;

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}
function displayDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[2]}.${m[3]}.${m[1].slice(2)}` : iso;
}
// Airtable stores a raw issue number (e.g. 7). The "№ 007" presentation is the
// app's job — tolerant of a bare number or an already-formatted value.
function formatNo(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits ? `№ ${digits.padStart(3, "0")}` : raw;
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
      // Tagged so /api/revalidate can flush it on demand (instant updates).
      next: { revalidate: REVALIDATE, tags: ["reviews"] },
    });
    if (!res.ok) {
      console.error("getReviews: Airtable fetch failed", res.status, await res.text());
      break;
    }
    const data = await res.json();
    for (const rec of data.records as Array<{ id: string; fields: Record<string, unknown> }>) {
      const f = rec.fields || {};
      const iso = str(f["Date"]);
      // The marquee image is the uploaded Photo attachment, served through our
      // stable /api/photo proxy (robust to Airtable's expiring URLs). Every
      // published review is expected to carry one.
      const attachments = Array.isArray(f["Photo"])
        ? (f["Photo"] as Array<{ width?: number; height?: number }>)
        : [];
      const photo = attachments.length > 0;
      // The first attachment carries the true pixel dimensions; we thread them
      // through so themes can render at the image's natural aspect ratio
      // (the /api/photo proxy preserves aspect). Left undefined when absent.
      const first = photo ? attachments[0] : undefined;
      const width = typeof first?.width === "number" ? first.width : undefined;
      const height = typeof first?.height === "number" ? first.height : undefined;
      out.push({
        slug: rec.id,
        no: "", // derived from position after the full list is assembled (below)
        date: displayDate(iso),
        iso,
        section: str(f["Section"]),
        title: str(f["Title"]),
        venue: str(f["Venue"]),
        hood: str(f["Hood"]),
        by: str(f["Byline"]),
        dek: str(f["Dek"]),
        body: str(f["Body"]).split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
        image: photo ? `/api/photo/${rec.id}` : "",
        width,
        height,
        artist: str(f["Artist"]),
        artwork: str(f["Artwork"]),
        credit: str(f["Credit"]),
        alt: str(f["Alt"]) || str(f["Title"]),
      });
    }
    offset = data.offset;
  } while (offset);
  // № is derived from row position (newest-first → highest number), so there's
  // no manual "No" field to maintain in Airtable.
  const total = out.length;
  out.forEach((r, i) => {
    r.no = formatNo(String(total - i));
  });
  return out;
}
