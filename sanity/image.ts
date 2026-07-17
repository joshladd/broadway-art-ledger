import imageUrlBuilder from "@sanity/image-url";
// v2 exports the source type from the package root; the older
// "@sanity/image-url/lib/types/types" subpath no longer exists.
import type { SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = imageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
