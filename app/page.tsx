import { themes } from "@/lib/themes";
import { reviews } from "@/content/reviews";

// Theme picker — the gallery of design directions. Each card enters a full,
// clickable version of the publication.
export default function Index() {
  return (
    <main style={{ fontFamily: "var(--f-newsreader)", background: "#f6f4ec", color: "#211d17", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "72px 32px 96px" }}>
        <p style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "#b0331d", margin: 0 }}>
          Design prototype · pick a direction
        </p>
        <h1 style={{ fontFamily: "var(--f-fraunces)", fontWeight: 600, fontSize: "clamp(34px,6vw,60px)", lineHeight: 1.0, letterSpacing: "-0.02em", margin: "14px 0 10px" }}>
          The Broadway Art Ledger
        </h1>
        <p style={{ fontSize: 19, lineHeight: 1.6, maxWidth: "52ch", color: "#6d6658", margin: "0 0 44px" }}>
          Eight complete designs of the same publication — {reviews.length} reviews, an about page, and a submissions
          form. Enter any one to click through the whole site, then use the switcher to flip designs while keeping your place.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {themes.map((t, i) => (
            <a
              key={t.key}
              href={`/t/${t.key}`}
              style={{
                display: "block", border: "1px solid #d9d3c4", padding: "22px 22px 26px",
                background: "#fbfaf5", textDecoration: "none", color: "inherit",
              }}
            >
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6d6658" }}>
                Design {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ fontFamily: "var(--f-fraunces)", fontSize: 26, fontWeight: 600, margin: "8px 0 6px" }}>{t.name}</div>
              <div style={{ fontSize: 15, color: "#6d6658", lineHeight: 1.4 }}>{t.blurb}</div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
