"use server";

import { getArchivePage, searchArchive } from "@/lib/reviews-source";
import type { Page } from "@/lib/pagination";
import type { ArchiveItem } from "@/lib/map-review";

// Load the next page of the archive browse list (page view-model).
export async function loadMoreArchive(offset: number): Promise<Page<ArchiveItem>> {
  return getArchivePage(offset);
}

// Run a server-side search and return the matching rows.
export async function runArchiveSearch(query: string): Promise<ArchiveItem[]> {
  return searchArchive(query);
}
