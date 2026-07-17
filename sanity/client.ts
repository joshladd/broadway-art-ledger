import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

// Read-only client for the live site. useCdn: the CDN is fine because
// /api/revalidate flushes the tag the moment Bryan publishes.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
