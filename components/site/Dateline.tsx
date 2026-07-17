import type { Review } from "@/content/review";
import { formatRange } from "@/lib/format-date";
import styles from "./site.module.css";

// Bryan: "The location will be the institution title plus running dates i.e.,
// Alex Berns, May 15–June 13, 2026. Can we hyperlink here?"
//
// Yes — the dateline itself is the link (he chose this over a trailing "For
// more information on the show." sentence). With no showUrl it renders as plain
// text rather than a dead link.
export function Dateline({ review }: { review: Review }) {
  const range = formatRange(review.startDate, review.endDate);
  const text = [review.showName, range].filter(Boolean).join(", ");
  if (!text.trim()) return null;

  return (
    <p className={styles.dateline}>
      {review.showUrl ? (
        <a
          className={styles.datelineLink}
          href={review.showUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text}
        </a>
      ) : (
        text
      )}
    </p>
  );
}
