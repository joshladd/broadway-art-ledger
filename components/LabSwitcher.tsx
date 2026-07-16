"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Switcher.module.css";

type Ref = { key: string; name: string };

// Bottom switcher for the /lab blast. Only shows on a specific design page
// (/lab/<key>), not on the picker (/lab).
export default function LabSwitcher({ designs }: { designs: Ref[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = pathname.match(/^\/lab\/([^/]+)/)?.[1];
  const idx = designs.findIndex((d) => d.key === current);

  const go = useCallback(
    (delta: number) => {
      if (idx < 0) return;
      const d = designs[(idx + delta + designs.length) % designs.length];
      router.push(`/lab/${d.key}`);
    },
    [idx, router, designs]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (!current || idx < 0) return null;
  const cur = designs[idx];
  return (
    <div className={styles.bar} role="group" aria-label="Lab design switcher">
      <button className={styles.btn} onClick={() => go(-1)} aria-label="Previous design">&larr;</button>
      <span className={styles.label}>
        <span className={styles.k}>Lab {idx + 1} / {designs.length}</span>
        <span className={styles.n}>{cur?.name}</span>
      </span>
      <button className={styles.btn} onClick={() => go(1)} aria-label="Next design">&rarr;</button>
      <span className={styles.note}>&larr; &rarr; to flip</span>
    </div>
  );
}
