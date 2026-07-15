// Route helpers. Kept dependency-free to avoid import cycles with the theme registry.
export function tHref(t: string, sub = ""): string {
  return `/t/${t}${sub ? `/${sub}` : ""}`;
}
export function reviewHref(t: string, slug: string): string {
  return `/t/${t}/r/${slug}`;
}
