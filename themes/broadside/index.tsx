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
    <header className={styles.masthead}>
      <div className={styles.mastRow}>
        <a href={tHref(t)} className={styles.wordmark}>
          The Broadway<br />Art Ledger
        </a>
        <nav className={styles.nav}>
          {items.map((it, i) => (
            <a
              key={i}
              href={it.href}
              className={`${styles.navlink} ${it.label === active ? styles.navOn : ""}`}
            >
              {it.label}
            </a>
          ))}
        </nav>
      </div>
      <div className={styles.strapWrap}>
        <span className={styles.strapMark}>Broadside</span>
        <p className={styles.strap}>{strap}</p>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footRule} />
      <p className={styles.motto}>“{motto}”</p>
      <ul className={styles.facts}>
        {facts.map((f, i) => (
          <li key={i} className={styles.fact}>
            {f}
          </li>
        ))}
      </ul>
    </footer>
  );
}

function Home({ reviews, t }: { reviews: Review[]; t: string }) {
  return (
    <div className={styles.page}>
      <Header t={t} active="Current" />
      <div className={styles.feed}>
        {reviews.map((r, i) => (
          <article
            key={r.slug}
            className={`${styles.entry} ${i % 2 === 1 ? styles.entryFlip : ""}`}
          >
            <div className={styles.meta}>
              <span className={styles.metaDate}>{r.date}</span>
              <span className={styles.metaNo}>{r.no}</span>
            </div>
            <h2 className={styles.title}>
              {r.title}
            </h2>
            <p className={styles.byline}>
              {r.exhibition}, {r.venue} — by <b>{r.by}</b>
            </p>
            <p className={styles.dek}>{r.dek}</p>
            <figure className={styles.marquee}>
              <img className={styles.img} src={r.image} alt={r.alt} loading="lazy" />
              <span className={styles.caption}>{r.credit}</span>
            </figure>
            <div className={styles.copy}>
              {r.body.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </div>
      <Footer />
    </div>
  );
}

function ReviewPage({
  review,
  prev,
  next,
  t,
}: {
  review: Review;
  prev: Review | null;
  next: Review | null;
  t: string;
}) {
  return (
    <div className={styles.page}>
      <Header t={t} active="Current" />
      <article className={styles.article}>
        <a href={tHref(t)} className={styles.back}>
          Back to all reviews
        </a>
        <div className={styles.aHead}>
          <div className={styles.aHeadText}>
            <div className={styles.meta}>
              <span className={styles.metaDate}>{review.date}</span>
              <span className={styles.metaNo}>{review.no}</span>
            </div>
            <h1 className={styles.aTitle}>{review.title}</h1>
            <p className={styles.venue}>
              {review.exhibition}, {review.venue}
            </p>
            <p className={styles.artByline}>by {review.by}</p>
          </div>
          <figure className={styles.aFigure}>
            <img className={styles.hero} src={review.image} alt={review.alt} />
            <figcaption className={styles.heroCap}>
              <b>
                {review.artist}, {review.artwork}.
              </b>{" "}
              {review.credit}
            </figcaption>
          </figure>
        </div>
        <div className={styles.body}>
          {review.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <nav className={styles.pager}>
          {prev ? (
            <a className={styles.pagerLink} href={reviewHref(t, prev.slug)}>
              <span className={styles.pagerDir}>Previous</span>
              <span className={styles.pagerTitle}>{prev.title}</span>
            </a>
          ) : (
            <span />
          )}
          {next ? (
            <a
              className={`${styles.pagerLink} ${styles.pagerNext}`}
              href={reviewHref(t, next.slug)}
            >
              <span className={styles.pagerDir}>Next</span>
              <span className={styles.pagerTitle}>{next.title}</span>
            </a>
          ) : (
            <span />
          )}
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
          {about.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
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
        <h1 className={styles.aboutTitle}>Submit a pitch</h1>
        <p className={styles.submitIntro}>
          Pitches are read blind, in the order received. Tell us your position on the show — not
          the press release.
        </p>
        {sent && (
          <div className={styles.sent}>
            Thank you — your pitch is in the queue. We read every one.
          </div>
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
                {f.label}
                {f.required && <span className={styles.req}> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={f.name}
                  name={f.name}
                  className={styles.textarea}
                  placeholder={f.placeholder}
                  required={f.required}
                />
              ) : f.type === "select" ? (
                <select id={f.name} name={f.name} className={styles.select} defaultValue="">
                  <option value="" disabled>
                    Select…
                  </option>
                  {f.options?.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  className={styles.input}
                  placeholder={f.placeholder}
                  required={f.required}
                />
              )}
              {f.help && <span className={styles.fhelp}>{f.help}</span>}
            </div>
          ))}
          <button type="submit" className={styles.submitBtn}>
            Send pitch
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}

const theme: ThemeModule = {
  meta: {
    key: "broadside",
    name: "Broadside",
    blurb: "Warm paper, ink-blue hairlines, big Fraunces serif over a continuous asymmetric reading column.",
  },
  Home,
  ReviewPage,
  About,
  Submit,
};
export default theme;
