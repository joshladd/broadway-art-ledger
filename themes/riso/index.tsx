import type { Review, SubmitField } from "@/content/reviews";
import { facts, motto, strap } from "@/content/reviews";
import type { AboutContent, ThemeModule } from "@/lib/themes";
import { reviewHref, tHref } from "@/lib/paths";
import styles from "./styles.module.css";

function Duotone({ src, alt, className }: { src: string; alt: string; className?: string }) {
  // Pure-CSS risograph duotone: the <img> is desaturated, then two ink layers
  // (blue multiply + red screen) are blended over it via ::before / ::after.
  // On hover the ink layers fade and the original full-color art returns.
  return (
    <span className={`${styles.duo} ${className ?? ""}`}>
      <img className={styles.duoImg} src={src} alt={alt} loading="lazy" />
    </span>
  );
}

function Header({ t, active }: { t: string; active: string }) {
  const items = [
    { label: "Current", href: tHref(t) },
    { label: "Archive", href: tHref(t) },
    { label: "About", href: tHref(t, "about") },
    { label: "Submit", href: tHref(t, "submit") },
  ];
  return (
    <>
      <header className={styles.header}>
        <a href={tHref(t)} className={styles.wordmark}>
          <span className={styles.wmBlue}>The Broadway</span>
          <span className={styles.wmRed}>Art Ledger</span>
        </a>
        <nav className={styles.nav}>
          {items.map((it, i) => (
            <a key={i} href={it.href} className={`${styles.navlink} ${it.label === active ? styles.navOn : ""}`}>
              {it.label}
            </a>
          ))}
        </nav>
      </header>
      <p className={styles.strap}>
        <span className={styles.strapMark}>▚</span> {strap}
      </p>
    </>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.colophon}>Printed in two inks</div>
      <div className={styles.facts}>
        {facts.map((f, i) => (
          <span key={i} className={styles.fact}>{f}</span>
        ))}
      </div>
      <p className={styles.motto}>“{motto}”</p>
    </footer>
  );
}

function Home({ reviews, t }: { reviews: Review[]; t: string }) {
  return (
    <div className={styles.page}>
      <Header t={t} active="Current" />
      <div className={styles.feed}>
        {reviews.map((r) => (
          <article key={r.slug} className={styles.entry}>
            <div className={styles.meta}>
              <span className={styles.metaSection}>{r.section}</span>
              <span className={styles.metaDate}>{r.date}</span>
              <span className={styles.metaNo}>{r.no}</span>
            </div>
            <a href={reviewHref(t, r.slug)} className={styles.figure}>
              <Duotone src={r.image} alt={r.alt} />
            </a>
            <p className={styles.caption}>{r.credit}</p>
            <a href={reviewHref(t, r.slug)} className={styles.title}>{r.title}</a>
            <div className={styles.byline}>
              {r.venue}, {r.hood} — by <b>{r.by}</b>
            </div>
            <p className={styles.dek}>{r.dek}</p>
            <p className={styles.teaser}>{r.body[0]}</p>
            <a href={reviewHref(t, r.slug)} className={styles.more}>Read the review →</a>
          </article>
        ))}
      </div>
      <Footer />
    </div>
  );
}

function ReviewPage({ review, prev, next, t }: { review: Review; prev: Review | null; next: Review | null; t: string }) {
  return (
    <div className={styles.page}>
      <Header t={t} active="Current" />
      <article className={styles.article}>
        <a href={tHref(t)} className={styles.back}>← All reviews</a>
        <div className={styles.meta}>
          <span className={styles.metaSection}>{review.section}</span>
          <span className={styles.metaDate}>{review.date}</span>
          <span className={styles.metaNo}>{review.no}</span>
        </div>
        <h1 className={styles.aTitle}>{review.title}</h1>
        <p className={styles.venue}>{review.venue}, {review.hood}</p>
        <p className={styles.artByline}>by {review.by}</p>
        <Duotone src={review.image} alt={review.alt} className={styles.hero} />
        <p className={styles.heroCap}>{review.credit}</p>
        <div className={styles.body}>
          {review.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <p className={styles.artLine}>
          <span className={styles.artLineKey}>Artwork</span> {review.artist}, <em>{review.artwork}</em>
        </p>
        <nav className={styles.pager}>
          {prev ? (
            <a className={styles.pagerLink} href={reviewHref(t, prev.slug)}>← Previous<span>{prev.title}</span></a>
          ) : <span />}
          {next ? (
            <a className={`${styles.pagerLink} ${styles.pagerNext}`} href={reviewHref(t, next.slug)}>Next →<span>{next.title}</span></a>
          ) : <span />}
        </nav>
      </article>
      <Footer />
    </div>
  );
}

function About({ about, t }: { about: AboutContent; t: string }) {
  return (
    <div className={styles.page}>
      <Header t={t} active="About" />
      <div className={styles.about}>
        <h1 className={styles.aboutTitle}>{about.title}</h1>
        <p className={styles.lede}>{about.lede}</p>
        <div className={styles.aboutBody}>
          {about.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Submit({ fields, t, sent }: { fields: SubmitField[]; t: string; sent: boolean }) {
  return (
    <div className={styles.page}>
      <Header t={t} active="Submit" />
      <div className={styles.submit}>
        <h1 className={styles.aboutTitle}>Submit a pitch</h1>
        <p className={styles.submitIntro}>
          Pitches are read blind, in the order received. Tell us your position on the show — not the press release.
        </p>
        {sent && (
          <div className={styles.sent}>Thank you — your pitch is in the queue. We read every one.</div>
        )}
        <form className={styles.form} action="/api/pitch" method="post">
          <input type="hidden" name="theme" value={t} />
          {fields.map((f) => (
            <div key={f.name} className={styles.field}>
              <label className={styles.flabel} htmlFor={f.name}>
                {f.label}{f.required && <span className={styles.req}> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea id={f.name} name={f.name} className={styles.textarea} placeholder={f.placeholder} required={f.required} />
              ) : f.type === "select" ? (
                <select id={f.name} name={f.name} className={styles.select} defaultValue="">
                  <option value="" disabled>Select…</option>
                  {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input id={f.name} name={f.name} type={f.type} className={styles.input} placeholder={f.placeholder} required={f.required} />
              )}
              {f.help && <span className={styles.fhelp}>{f.help}</span>}
            </div>
          ))}
          <button type="submit" className={styles.submitBtn}>Send pitch</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

const theme: ThemeModule = {
  meta: { key: "riso", name: "Riso", blurb: "Two inks, off-register — art criticism printed like a zine." },
  Home,
  ReviewPage,
  About,
  Submit,
};
export default theme;
