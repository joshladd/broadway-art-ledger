import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
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
    const href = String(value?.href ?? "");
    const external = /^https?:\/\//i.test(href);
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

const proseComponents: PortableTextComponents = { marks: linkMark };
const guidelinesComponents: PortableTextComponents = {
  marks: linkMark,
  list: bulletList,
};

export function PortableCopy({
  value,
  variant = "prose",
}: {
  value: PortableTextBlock[];
  variant?: "prose" | "guidelines";
}) {
  if (!value?.length) return null;
  return (
    <PortableText
      value={value}
      components={variant === "guidelines" ? guidelinesComponents : proseComponents}
    />
  );
}
