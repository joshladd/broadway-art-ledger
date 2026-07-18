import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { marks } from "./portable-marks";
import styles from "./site.module.css";

// Sanity's default block content, rendered in a .prose container. Only the link
// mark is customized (scheme-checked, target/rel) — see portable-marks.
const components: PortableTextComponents = { marks };

export function Body({ value }: { value: PortableTextBlock[] }) {
  if (!value?.length) return null;
  return (
    <div className={styles.prose}>
      <PortableText value={value} components={components} />
    </div>
  );
}
