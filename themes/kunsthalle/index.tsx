import type { Review, SubmitField } from "@/content/reviews";
import { facts, motto, strap } from "@/content/reviews";
import type { AboutContent, ThemeModule } from "@/lib/themes";
import { reviewHref, tHref } from "@/lib/paths";
import styles from "./styles.module.css";

function Header({ t, active }: { t: string; active: string }) {
  const items = [
    { label: "Current", href: tHref(t) },
    { label: "Archive", href: `/designs/archive?from=${t}` },
    { label: "About", href: tHref(t, "about") },
    { label: "Submit", href: tHref(t, "submit") },
  ];
  return (
    <header className={styles.header}>
      <div className={styles.headBar}>
        <a href={tHref(t)} className={styles.wordmark}>
          The Broadway Art Ledger
        </a>
        <nav className={styles.nav}>
          {items.map((it, i) => (
            <a key={i} href={it.href} className={`${styles.navlink} ${it.label === active ? styles.navOn : ""}`}>
              {it.label}
            </a>
          ))}
        </nav>
      </div>
      <p className={styles.strap}>{strap}</p>
    </header>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <ul className={styles.facts}>
        {facts.map((f, i) => (
          <li key={i} className={styles.fact}>{f}</li>
        ))}
      </ul>
      <p className={styles.motto}>{motto}</p>
      <p className={styles.colophon}>The Broadway Art Ledger — New York</p>
    </footer>
  );
}

function Home({ reviews, t }: { reviews: Review[]; t: string }) {
  return (
    <div className={styles.root}>
      <Header t={t} active="Current" />
      <div className={styles.feed}>
        {reviews.map((r) => (
          <article key={r.slug} className={styles.entry}>
            <figure className={styles.figure}>
              <img className={styles.img} src={r.image} alt={r.alt} loading="lazy" />
            </figure>
            <p className={styles.credit}>{r.credit}</p>
            <div className={styles.entryText}>
              <div className={styles.meta}>
                <span>{r.no}</span>
                <span>{r.date}</span>
              </div>
              <h2 className={styles.title}>{r.title}</h2>
              <p className={styles.venue}>{r.exhibition}, {r.venue}</p>
              <p className={styles.dek}>{r.dek}</p>
              <p className={styles.byline}>By {r.by}</p>
            </div>
            <div className={styles.copy}>
              {r.body.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </article>
        ))}
      </div>
      <Footer />
    </div>
  );
}

function ReviewPage({ review, prev, next, t }: { review: Review; prev: Review | null; next: Review | null; t: string }) {
  return (
    <div className={styles.root}>
      <Header t={t} active="Current" />
      <article className={styles.article}>
        <a href={tHref(t)} className={styles.back}>Index</a>
        <figure className={styles.heroFig}>
          <img className={styles.hero} src={review.image} alt={review.alt} />
          <figcaption className={styles.credit}>{review.credit}</figcaption>
        </figure>
        <div className={styles.articleHead}>
          <div className={styles.meta}>
            <span>{review.no}</span>
            <span>{review.date}</span>
          </div>
          <h1 className={styles.aTitle}>{review.title}</h1>
          <p className={styles.aVenue}>{review.exhibition}, {review.venue}</p>
          <p className={styles.aByline}>By {review.by}</p>
        </div>
        <p className={styles.aDek}>{review.dek}</p>
        <div className={styles.body}>
          {review.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <nav className={styles.pager}>
          {prev
            ? <a className={styles.pagerLink} href={reviewHref(t, prev.slug)}><span className={styles.pagerDir}>Previous</span><span className={styles.pagerName}>{prev.title}</span></a>
            : <span />}
          {next
            ? <a className={`${styles.pagerLink} ${styles.pagerNext}`} href={reviewHref(t, next.slug)}><span className={styles.pagerDir}>Next</span><span className={styles.pagerName}>{next.title}</span></a>
            : <span />}
        </nav>
      </article>
      <Footer />
    </div>
  );
}

function About({ about, t }: { about: AboutContent; t: string }) {
  return (
    <div className={styles.root}>
      <Header t={t} active="About" />
      <div className={styles.plain}>
        <h1 className={styles.plainTitle}>{about.title}</h1>
        <p className={styles.lede}>{about.lede}</p>
        <div className={styles.plainBody}>
          {about.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Submit({ fields, t, sent, error }: { fields: SubmitField[]; t: string; sent: boolean; error: boolean }) {
  return (
    <div className={styles.root}>
      <Header t={t} active="Submit" />
      <div className={styles.plain}>
        <h1 className={styles.plainTitle}>Submit a pitch</h1>
        <p className={styles.submitIntro}>
          Pitches are read blind, in the order received. Tell us your position on the show — not the press release.
        </p>
        {sent && (
          <div className={styles.sent}>Received. Your pitch is in the queue, and we read every one.</div>
        )}
        {error && (
          <div className={styles.error} role="alert">That didn’t send. Please try again.</div>
        )}
        <form className={styles.form} action="/api/pitch" method="post">
          <input type="hidden" name="theme" value={t} />
          {fields.map((f) => (
            <div key={f.name} className={styles.field}>
              <label className={styles.flabel} htmlFor={f.name}>
                {f.label}{f.required && <span className={styles.req}> (required)</span>}
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
  meta: { key: "kunsthalle", name: "Kunsthalle", blurb: "Museum-wall restraint — Newsreader serif, near-white walls, only the art has color." },
  Home,
  ReviewPage,
  About,
  Submit,
};
export default theme;
