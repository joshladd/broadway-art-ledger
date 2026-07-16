// Stable, edge-cached image proxy for review photos uploaded in Airtable.
// Airtable's attachment URLs expire (~2h); this route always resolves the
// current URL for a Reviews record and serves its resized large thumbnail, so
// the <img src> never breaks and phone-photo sizes are tamed. No theme changes.
const TOKEN = process.env.AIRTABLE_TOKEN;
const BASE = process.env.AIRTABLE_BASE_ID;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!TOKEN || !BASE) return new Response("not configured", { status: 500 });

  const recRes = await fetch(`https://api.airtable.com/v0/${BASE}/Reviews/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
    next: { revalidate: 60 },
  });
  if (!recRes.ok) return new Response("not found", { status: 404 });

  const rec = await recRes.json();
  const photo = rec?.fields?.Photo?.[0];
  const src = photo?.thumbnails?.large?.url || photo?.thumbnails?.full?.url || photo?.url;
  if (!src) return new Response("no image", { status: 404 });

  const img = await fetch(src, { next: { revalidate: 60 } });
  if (!img.ok) return new Response("upstream fetch failed", { status: 502 });

  return new Response(await img.arrayBuffer(), {
    headers: {
      "Content-Type": img.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
