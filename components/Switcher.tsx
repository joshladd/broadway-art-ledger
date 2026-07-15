"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import styles from "./Switcher.module.css";

type ThemeRef = { key: string; name: string };

export default function Switcher({ themes, current }: { themes: ThemeRef[]; current: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const rest = pathname.replace(/^\/t\/[^/]+/, "");
  const idx = Math.max(0, themes.findIndex((t) => t.key === current));

  const go = useCallback(
    (delta: number) => {
      const t = themes[(idx + delta + themes.length) % themes.length];
      router.push(`/t/${t.key}${rest}`);
    },
    [idx, rest, router, themes]
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

  const cur = themes[idx];
  return (
    <div className={styles.bar} role="group" aria-label="Design switcher">
      <button className={styles.btn} onClick={() => go(-1)} aria-label="Previous design">&larr;</button>
      <span className={styles.label}>
        <span className={styles.k}>Design {idx + 1} / {themes.length}</span>
        <span className={styles.n}>{cur?.name}</span>
      </span>
      <button className={styles.btn} onClick={() => go(1)} aria-label="Next design">&rarr;</button>
      <span className={styles.note}>&larr; &rarr; to flip</span>
    </div>
  );
}
