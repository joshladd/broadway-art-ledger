import type { Review, SubmitField } from "@/content/reviews";
import { facts, motto, strap } from "@/content/reviews";
import type { AboutContent, ThemeModule } from "@/lib/themes";
import { reviewHref, tHref } from "@/lib/paths";
import styles from "./styles.module.css";

function Nav({ t, active }: { t: string; active: string }) {
  const items = [
    { label: "Current", href: tHref(t) },
    { label: "Archive", href: `/archive?from=${t}` },
    { label: "About", href: tHref(t, "about") },
    { label: "Submit", href: tHref(t, "submit") },
  ];
  return (
    <nav className={styles.nav}>
      {items.map((it, i) => (
        <a key={i} href={it.href} className={`${styles.navlink} ${it.label === active ? styles.navOn : ""}`}>
          {it.label}
        </a>
      ))}
    </nav>
  );
}

// The wordmark IS the design. On Home it fills the top edge-to-edge; on
// interior pages the same lockup returns, smaller, as a running header.
function Masthead({ t, active, big }: { t: string; active: string; big?: boolean }) {
  return (
    <header className={`${styles.masthead} ${big ? styles.mastheadBig : styles.mastheadSmall}`}>
      <a href={tHref(t)} className={styles.wordmark} aria-label="The Broadway Art Ledger">
        <span className={styles.wLine}>The Broadway</span>
        <span className={styles.wLine}>
          Art <em className={styles.wAccent}>Ledger</em>
        </span>
      </a>
      <div className={styles.headRule} />
      <div className={styles.headBar}>
        <p className={styles.strap}>{strap}</p>
        <Nav t={t} active={active} />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.facts}>
        {facts.map((f, i) => (
          <span key={i} className={styles.fact}>{f}</span>
        ))}
      </div>
      <p className={styles.motto}>“{motto}”</p>
      <p className={styles.colophon}>The Broadway Art Ledger — set in Fraunces &amp; Newsreader.</p>
    </footer>
  );
}

function Home({ reviews, t }: { reviews: Review[]; t: string }) {
  return (
    <div className={styles.page}>
      <Masthead t={t} active="Current" big />
      <div className={styles.feed}>
        {reviews.map((r) => (
          <article key={r.slug} className={styles.entry}>
            <div className={styles.meta}>
              <span>{r.date}</span>
              <span className={styles.metaNo}>{r.no}</span>
            </div>
            <h2 className={styles.title}>{r.title}</h2>
            <div className={styles.byline}>{r.exhibition}, {r.venue} — by <b>{r.by}</b></div>
            <p className={styles.dek}>{r.dek}</p>
            <figure className={styles.figure}>
              <img className={styles.img} src={r.image} alt={r.alt} loading="lazy" />
            </figure>
            <p className={styles.caption}>{r.credit}</p>
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
    <div className={styles.page}>
      <Masthead t={t} active="Current" />
      <article className={styles.article}>
        <a href={tHref(t)} className={styles.back}>← All reviews</a>
        <div className={styles.meta}>
          <span>{review.date}</span>
          <span className={styles.metaNo}>{review.no}</span>
        </div>
        <h1 className={styles.aTitle}>{review.title}</h1>
        <p className={styles.venue}>{review.exhibition}, {review.venue}</p>
        <p className={styles.artByline}>by {review.by}</p>
        <p className={styles.aDek}>{review.dek}</p>
        <figure className={styles.heroFig}>
          <img className={styles.hero} src={review.image} alt={review.alt} />
          <figcaption className={styles.heroCap}>{review.credit}</figcaption>
        </figure>
        <div className={styles.body}>
          {review.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
        <p className={styles.artline}>
          {review.artist}, <em>{review.artwork}</em>
        </p>
        <nav className={styles.pager}>
          {prev ? <a className={styles.pagerLink} href={reviewHref(t, prev.slug)}>← Previous<span>{prev.title}</span></a> : <span />}
          {next ? <a className={`${styles.pagerLink} ${styles.pagerNext}`} href={reviewHref(t, next.slug)}>Next →<span>{next.title}</span></a> : <span />}
        </nav>
      </article>
      <Footer />
    </div>
  );
}

function About({ about, t }: { about: AboutContent; t: string }) {
  return (
    <div className={styles.page}>
      <Masthead t={t} active="About" />
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

function Submit({ fields, t, sent, error }: { fields: SubmitField[]; t: string; sent: boolean; error: boolean }) {
  return (
    <div className={styles.page}>
      <Masthead t={t} active="Submit" />
      <div className={styles.submit}>
        <h1 className={styles.aboutTitle}>Submit a pitch</h1>
        <p className={styles.submitIntro}>
          Pitches are read blind, in the order received. Tell us your position on the show — not the press release.
        </p>
        {sent && (
          <div className={styles.sent}>Thank you — your pitch is in the queue. We read every one.</div>
        )}
        {error && (
          <div className={styles.error} role="alert">
            Something went wrong — your pitch didn’t send. Please try again.
          </div>
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
  meta: { key: "marquee", name: "Marquee", blurb: "Bone, ink and one warm red — the wordmark is the whole show." },
  Home,
  ReviewPage,
  About,
  Submit,
};
export default theme;
