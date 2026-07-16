import { NextResponse } from "next/server";

// Branded Submit form (shared by every design) posts here; we create a record in
// the Airtable "Pitches" table with Status = New so it lands in the Blind review view.
const TOKEN = process.env.AIRTABLE_TOKEN;
const BASE = process.env.AIRTABLE_BASE_ID;
const TABLE = process.env.AIRTABLE_TABLE || "Pitches";

export async function POST(req: Request) {
  const form = await req.formData();
  const val = (k: string) => {
    const v = form.get(k);
    return v == null ? "" : String(v).trim();
  };
  const theme = val("theme") || "ledger";

  // Map our form fields -> exact Airtable column names. Skip empties so the
  // url/select columns don't reject blank values.
  const fields: Record<string, string> = { Status: "New" };
  const put = (col: string, v: string) => { if (v) fields[col] = v; };
  put("Show / Exhibition", val("show"));
  put("Venue", val("venue"));
  put("Discipline", val("section"));
  put("Pitch", val("pitch"));
  put("Writing sample", val("sample"));
  put("Name", val("name"));
  put("Email", val("email"));

  const back = (q: string) => NextResponse.redirect(new URL(`/t/${theme}/submit?${q}`, req.url), 303);

  try {
    if (!TOKEN || !BASE) throw new Error("Airtable env not configured");
    const res = await fetch(`https://api.airtable.com/v0/${BASE}/${encodeURIComponent(TABLE)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ records: [{ fields }], typecast: true }),
    });
    if (!res.ok) {
      console.error("Airtable create failed:", res.status, await res.text());
      return back("error=1");
    }
  } catch (e) {
    console.error("Pitch submit error:", e);
    return back("error=1");
  }
  return back("sent=1");
}
