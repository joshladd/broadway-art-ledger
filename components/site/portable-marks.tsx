import type { PortableTextComponents } from "@portabletext/react";
import { safeHref, isExternal } from "@/lib/safe-href";

// Shared Portable Text mark renderers, used by both Body and PortableCopy so the
// link rule has one home. The link mark is load-bearing security: every
// CMS-provided href is scheme-checked (safeHref), and a rejected one (e.g.
// `javascript:`) renders as plain text with no anchor. External links open in a
// new tab with rel guards; mailto/relative links open in place.
//
// Deliberately CSS-free so it stays unit-testable (the components import CSS
// modules, which the test runner can't parse).
export const marks: PortableTextComponents["marks"] = {
  link: ({ value, children }) => {
    const href = safeHref(value?.href);
    if (!href) return <>{children}</>;
    const external = isExternal(href);
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
};
