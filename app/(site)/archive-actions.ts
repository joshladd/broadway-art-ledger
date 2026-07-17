"use server";

import { getArchivePage, searchArchive, ARCHIVE_PAGE_SIZE } from "@/lib/reviews-source";
import type { ArchiveItem } from "@/lib/map-review";

// Load the next page of the archive browse list. `hasMore` is a full page came
// back (there may be more).
export async function loadMoreArchive(
  offset: number,
): Promise<{ items: ArchiveItem[]; nextOffset: number; hasMore: boolean }> {
  const items = await getArchivePage(offset);
  return {
    items,
    nextOffset: offset + items.length,
    hasMore: items.length === ARCHIVE_PAGE_SIZE,
  };
}

// Run a server-side search and return the matching rows.
export async function runArchiveSearch(query: string): Promise<ArchiveItem[]> {
  return searchArchive(query);
}
