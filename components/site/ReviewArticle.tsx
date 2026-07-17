import Image from "next/image";
import type { Review } from "@/content/review";
import { Dateline } from "./Dateline";
import { Body } from "./Body";
import styles from "./site.module.css";

// Reading order: image -> caption -> headline -> dateline -> [tagline] -> body.
// No byline, no issue number, no separate credit line — only what the editor
// asked to show reaches the surface.
export function ReviewArticle({
  review,
  priority = false,
}: {
  review: Review;
  priority?: boolean;
}) {
  return (
    <article className={styles.entry}>
      {/* The caption is a child of the figure, so it takes the image's exact
          width and left edge — Bryan: "Make sure that the captions align with
          the images." */}
      <figure className={styles.figure}>
        <Image
          className={styles.img}
          src={review.image.url}
          alt={review.image.alt}
          width={review.image.width}
          height={review.image.height}
          sizes="(max-width: 820px) 100vw, 888px"
          priority={priority}
        />
        {review.image.caption && (
          <figcaption className={styles.caption}>{review.image.caption}</figcaption>
        )}
      </figure>

      <div className={styles.entryText}>
        <h2 className={styles.headline}>{review.headline}</h2>
        <Dateline review={review} />
        {review.tagline?.trim() ? (
          <p className={styles.tagline}>{review.tagline}</p>
        ) : null}
      </div>

      <Body value={review.body} />
    </article>
  );
}
