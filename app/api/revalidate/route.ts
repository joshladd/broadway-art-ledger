import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

// On-demand revalidation for instant content updates. Point the Sanity webhook
// (or a manual curl) at:
//   POST /api/revalidate?secret=YOUR_SECRET
// and the reviews data flushes immediately — Bryan publishes, the site updates,
// no waiting for the ISR window and no redeploy.
//
// Requires REVALIDATE_SECRET in the environment; without it the endpoint is
// disabled (503) so it can't be triggered anonymously.
//
// NB: this must be revalidateTag, not updateTag — updateTag is only callable
// from a Server Action and throws in a Route Handler.
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
  // Flush both tagged datasets — reviews and the editable copy singletons —
  // then regenerate the route tree. Next 16 takes a cache-life profile as the
  // second argument; "max" purges every entry carrying the tag regardless of
  // its own profile. One webhook fires for either kind of edit, so flush both.
  revalidateTag("reviews", "max");
  revalidateTag("copy", "max");
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidated: ["reviews", "copy"] });
}

export async function POST(req: Request) {
  return handle(req);
}
export async function GET(req: Request) {
  return handle(req);
}
