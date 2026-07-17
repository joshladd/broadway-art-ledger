import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import styles from "./site.module.css";

// Sanity's default block content. Bryan's "just hyperlink and italicize really"
// described a hypothetical hand-rolled CMS; with Sanity we take the defaults.
// Only links need a custom component, so external URLs get target/rel.
const components: PortableTextComponents = {
  marks: {
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
  },
};

export function Body({ value }: { value: PortableTextBlock[] }) {
  if (!value?.length) return null;
  return (
    <div className={styles.prose}>
      <PortableText value={value} components={components} />
    </div>
  );
}
