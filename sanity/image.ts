// v2 deprecated the default export and moved the source type to the package
// root (the old "@sanity/image-url/lib/types/types" subpath is gone).
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
