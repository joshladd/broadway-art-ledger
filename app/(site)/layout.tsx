// The site's global reset lives here, NOT in the root layout, so it does not
// reach the embedded Sanity Studio at /studio. The site and the Studio share
// one document; when this reset was global, its bare `svg { max-width: 100% }`
// collapsed Sanity's icons (verified: icons rendered 9px wide instead of ~21px)
// and `button { font: inherit }` overrode Sanity's button sizing. Scoping the
// stylesheet to the (site) group leaves the Studio to style itself.
import "../globals.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
