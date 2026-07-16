import Link from "next/link";
import { labs } from "@/lib/lab";
import styles from "./page.module.css";

export const metadata = {
  title: "The Lab — The Broadway Art Ledger",
  description: "Five experimental readings of the same publication.",
};

export default function LabPicker() {
  return (
    <main className={styles.main}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>The Broadway Art Ledger</p>
        <h1 className={styles.title}>The Lab</h1>
        <p className={styles.lede}>
          Five experimental readings of the same reviews — different ways to move
          through the work. Same words, same pictures; new use of space.
        </p>
      </header>
      <ol className={styles.list}>
        {labs.map((d, i) => (
          <li key={d.key} className={styles.item}>
            <Link href={`/lab/${d.key}`} className={styles.link}>
              <span className={styles.no}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.name}>{d.name}</span>
              <span className={styles.blurb}>{d.blurb}</span>
              <span className={styles.arrow} aria-hidden>&rarr;</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className={styles.foot}>
        <Link href="/" className={styles.back}>&larr; Back to the eight designs</Link>
      </p>
    </main>
  );
}
