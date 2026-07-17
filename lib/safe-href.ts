// React does NOT sanitize the href attribute, so a CMS-provided link value of
// `javascript:...` would render as a clickable script URL — stored XSS. Every
// href that originates from Sanity (Portable Text link marks, a review's
// showUrl, the submit formUrl) goes through here first.
//
// Allowed: http(s), mailto, and relative URLs (path / query / fragment).
// Anything else resolves to null so the caller can drop the anchor.
export function safeHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  const h = href.trim();
  if (!h) return null;
  if (/^(\/|#|\?)/.test(h)) return h; // relative
  if (/^(https?:|mailto:)/i.test(h)) return h; // allowed absolute schemes
  return null;
}

// A safe href points off-site when it uses an http(s) scheme (mailto and
// relative links stay in place / open the mail client).
export function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
