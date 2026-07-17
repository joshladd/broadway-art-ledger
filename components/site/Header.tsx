import { wordmark } from "@/content/site";
import { getStrap } from "@/lib/site-content";
import styles from "./site.module.css";

// Bryan: 'Instead of "Current," let's do "Reviews" for now, then shift to
// "Current" and "Archive" in the future.' The Archive ships now — only the
// rename is deferred.
//
// Four surfaces, nothing else. No Mark and no footer: neither was called out.
const NAV = [
  { label: "Reviews", href: "/" },
  { label: "Archive", href: "/archive" },
  { label: "About", href: "/about" },
  { label: "Submit", href: "/submit" },
];

// Async server component: the tagline is editable in Sanity, so the Header
// fetches it (getStrap is React-cached, so multiple renders share one request).
export async function Header({ active }: { active: string }) {
  const strap = await getStrap();
  return (
    <header className={styles.header}>
      <div className={styles.headBar}>
        <a href="/" className={styles.wordmark}>
          {wordmark}
        </a>
        <nav className={styles.nav} aria-label="Primary">
          {NAV.map((it) => (
            <a
              key={it.label}
              href={it.href}
              className={`${styles.navlink} ${it.label === active ? styles.navOn : ""}`}
              aria-current={it.label === active ? "page" : undefined}
            >
              {it.label}
            </a>
          ))}
        </nav>
      </div>
      <p className={styles.strap}>{strap}</p>
    </header>
  );
}
