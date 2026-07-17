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
      <div className={styles.masthead}>
        <a href={tHref(t)} className={styles.wordmark}>
          The Broadway <em>Art Ledger</em>
        </a>
        <span className={styles.imprint}>Catalogue Raisonné</span>
      </div>
      <nav className={styles.nav}>
        {items.map((it, i) => (
          <a key={i} href={it.href} className={`${styles.navlink} ${it.label === active ? styles.navOn : ""}`}>
            {it.label}
          </a>
        ))}
      </nav>
      <p className={styles.strap}>{strap}</p>
    </header>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.colophon}>
        {facts.map((f, i) => (
          <span key={i} className={styles.fact}>{f}</span>
        ))}
      </div>
      <p className={styles.motto}>“{motto}”</p>
    </footer>
  );
}

// The ledger block — a review's facts set as an elegant ruled catalogue table.
function PlateLedger({ review }: { review: Review }) {
  const rows: [string, string][] = [
    ["Plate", review.no],
    ["Date", review.date],
    ["Venue", `${review.exhibition}, ${review.venue}`],
    ["Artist", review.artist],
    ["Critic", review.by],
  ];
  return (
    <dl className={styles.ledger}>
      {rows.map(([k, v]) => (
        <div key={k} className={styles.ledgerRow}>
          <dt className={styles.ledgerKey}>{k}</dt>
          <dd className={styles.ledgerVal}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Home({ reviews, t }: { reviews: Review[]; t: string }) {
  return (
    <div className={styles.page}>
      <Header t={t} active="Current" />
      <div className={styles.feed}>
        <div className={styles.feedHead}>
          <span className={styles.feedLabel}>The Current Plates</span>
          <span className={styles.feedCount}>{reviews.length} entries</span>
        </div>
        {reviews.map((r) => (
          <article key={r.slug} className={styles.plate}>
            <div className={styles.plateHead}>
              <span className={styles.plateNo}>{r.no}</span>
            </div>
            <h2 className={styles.title}>{r.title}</h2>
            <p className={styles.artwork}>
              <span className={styles.artworkArtist}>{r.artist}</span>, <em>{r.artwork}</em>
            </p>
            <p className={styles.dek}>{r.dek}</p>
            <PlateLedger review={r} />
            <figure className={styles.plateArt}>
              <img className={styles.img} src={r.image} alt={r.alt} loading="lazy" />
              <figcaption className={styles.caption}>{r.credit}</figcaption>
            </figure>
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
      <Header t={t} active="Current" />
      <article className={styles.article}>
        <a href={tHref(t)} className={styles.back}>← Return to the plates</a>
        <div className={styles.entryHead}>
          <span className={styles.entryNo}>{review.no}</span>
        </div>
        <h1 className={styles.aTitle}>{review.title}</h1>
        <p className={styles.artwork}>
          <span className={styles.artworkArtist}>{review.artist}</span>, <em>{review.artwork}</em>
        </p>
        <figure className={styles.heroWrap}>
          <img className={styles.hero} src={review.image} alt={review.alt} />
          <figcaption className={styles.heroCap}>{review.credit}</figcaption>
        </figure>
        <div className={styles.entryGrid}>
          <aside className={styles.entryAside}>
            <PlateLedger review={review} />
          </aside>
          <div className={styles.body}>
            <p className={styles.dekLead}>{review.dek}</p>
            {review.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
        <nav className={styles.pager}>
          {prev ? (
            <a className={styles.pagerLink} href={reviewHref(t, prev.slug)}>
              <span className={styles.pagerDir}>← Previous plate</span>
              <span className={styles.pagerNo}>{prev.no}</span>
              <span className={styles.pagerTitle}>{prev.title}</span>
            </a>
          ) : <span />}
          {next ? (
            <a className={`${styles.pagerLink} ${styles.pagerNext}`} href={reviewHref(t, next.slug)}>
              <span className={styles.pagerDir}>Next plate →</span>
              <span className={styles.pagerNo}>{next.no}</span>
              <span className={styles.pagerTitle}>{next.title}</span>
            </a>
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
        <span className={styles.aboutKicker}>Colophon</span>
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
      <Header t={t} active="Submit" />
      <div className={styles.submit}>
        <span className={styles.aboutKicker}>Submissions</span>
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
  meta: { key: "plate", name: "Plate", blurb: "Ivory and bronze, Fraunces figures — each review an auction-catalogue plate." },
  Home,
  ReviewPage,
  About,
  Submit,
};
export default theme;
