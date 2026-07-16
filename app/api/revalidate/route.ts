import { NextResponse } from "next/server";
import { revalidatePath, updateTag } from "next/cache";

// On-demand revalidation for instant content updates. Point an Airtable
// automation (or a manual curl) at:
//   POST /api/revalidate?secret=YOUR_SECRET
// and the reviews data flushes immediately — no 15s wait, no redeploy.
// Requires REVALIDATE_SECRET in the environment; without it the endpoint is
// disabled (503) so it can't be triggered anonymously.
function handle(req: Request): NextResponse {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "REVALIDATE_SECRET is not configured" },
      { status: 503 }
    );
  }
  const url = new URL(req.url);
  const given = url.searchParams.get("secret") ?? req.headers.get("x-revalidate-secret");
  if (given !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  // Flush the tagged reviews data, then regenerate the route tree.
  updateTag("reviews");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidated: "reviews" });
}

export async function POST(req: Request) {
  return handle(req);
}
export async function GET(req: Request) {
  return handle(req);
}
