import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "@/keystatic.config";
import type { Review } from "@/content/reviews";

// The site reads the committed content files (works in both local and github storage).
const reader = createReader(process.cwd(), keystaticConfig);

function displayDate(iso: string): string {
  // "2026-07-11" -> "07.11.26"
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[2]}.${m[3]}.${m[1].slice(2)}` : iso;
}

function normImage(img: string | null | undefined): string {
  if (!img) return "";
  return img.startsWith("/") ? img : `/art/${img.replace(/^.*[\\/]/, "")}`;
}

export async function getReviews(): Promise<Review[]> {
  const entries = await reader.collections.reviews.all();
  const list: Review[] = entries.map((e) => {
    const r = e.entry as Record<string, string | null>;
    const iso = (r.date as string) || "";
    return {
      slug: e.slug,
      no: (r.no as string) || "",
      date: displayDate(iso),
      iso,
      section: (r.section as string) || "",
      title: (r.title as string) || "",
      venue: (r.venue as string) || "",
      hood: (r.hood as string) || "",
      by: (r.by as string) || "",
      dek: (r.dek as string) || "",
      body: ((r.body as string) || "").split(/\n+/).map((s) => s.trim()).filter(Boolean),
      image: normImage(r.image as string),
      artist: (r.artist as string) || "",
      artwork: (r.artwork as string) || "",
      credit: (r.credit as string) || "",
      alt: (r.alt as string) || (r.title as string) || "",
    };
  });
  list.sort((a, b) => (a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0)); // newest first
  return list;
}
