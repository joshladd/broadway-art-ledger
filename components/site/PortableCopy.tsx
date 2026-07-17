import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { safeHref, isExternal } from "@/lib/safe-href";
import styles from "./site.module.css";

// Renders editable site copy (About / Submit) as Portable Text. Unlike Body,
// this does NOT wrap in .prose — About and Submit render into the existing
// .readerBody and .guidelines containers, whose CSS already styles p/em/a/li.
// So the output is identical to the old hard-coded JSX, just sourced from Sanity.
//
// Links know mailto from external: mailto opens in place, external opens a new
// tab. This subsumes both the old JARGON_BULLET essay link and the contact
// mailto, which used to be special-cased in the page components.
const linkMark: PortableTextComponents["marks"] = {
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

// A bulleted list styled as the Submit guidelines (the only bullet list in the
// editable copy).
const bulletList: PortableTextComponents["list"] = {
  bullet: ({ children }) => <ul className={styles.guidelines}>{children}</ul>,
};

// The Submit body is one rich-text field carrying its own hierarchy, so its
// headings map to the site's display type: the top title reads like a page
// title, section titles like the old subheads.
const editorialBlocks: PortableTextComponents["block"] = {
  h1: ({ children }) => <h1 className={styles.readerTitle}>{children}</h1>,
  h2: ({ children }) => <h2 className={styles.subhead}>{children}</h2>,
  h3: ({ children }) => <h3 className={styles.subhead}>{children}</h3>,
};

const proseComponents: PortableTextComponents = { marks: linkMark };
const editorialComponents: PortableTextComponents = {
  marks: linkMark,
  list: bulletList,
  block: editorialBlocks,
};

export function PortableCopy({
  value,
  variant = "prose",
}: {
  value: PortableTextBlock[];
  variant?: "prose" | "editorial";
}) {
  if (!value?.length) return null;
  return (
    <PortableText
      value={value}
      components={variant === "editorial" ? editorialComponents : proseComponents}
    />
  );
}
