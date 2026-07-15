import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Scrappy "backend": append the pitch to a JSON file, then redirect back with a
// confirmation. Swap for a real DB/CMS later without touching any theme.
export async function POST(req: Request) {
  const form = await req.formData();
  const data: Record<string, string> = {};
  for (const [k, v] of form.entries()) data[k] = String(v);
  const theme = data.theme || "ledger";

  try {
    const file = path.join(process.cwd(), "data", "pitches.json");
    await fs.mkdir(path.dirname(file), { recursive: true });
    let arr: unknown[] = [];
    try { arr = JSON.parse(await fs.readFile(file, "utf8")); } catch { arr = []; }
    arr.push({ ...data, at: new Date().toISOString() });
    await fs.writeFile(file, JSON.stringify(arr, null, 2), "utf8");
  } catch (e) {
    // non-fatal for the prototype
  }

  return NextResponse.redirect(new URL(`/t/${theme}/submit?sent=1`, req.url), 303);
}
