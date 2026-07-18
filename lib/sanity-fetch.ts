import { client } from "@/sanity/client";

// Every Sanity read goes through here, so the caching policy — the revalidate
// window and the tag-per-domain convention — lives in one place instead of being
// copied into each getter. A Sanity webhook flushes these tags on publish (see
// app/api/revalidate); the window is only the fallback if the webhook ever
// misses.
//
// `tag` groups a read by domain so publishing flushes exactly what changed:
//   "reviews" — review documents
//   "copy"    — the editable copy singletons
const REVALIDATE = 60;

export type CacheTag = "reviews" | "copy";

export function sanityFetch<T>(
  query: string,
  params: Record<string, unknown>,
  tag: CacheTag,
): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate: REVALIDATE, tags: [tag] },
  });
}
