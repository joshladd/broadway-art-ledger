// The exploration is frozen: it renders the static legacy seed, never live
// data. This is what keeps /designs immune to the live content model.
import { reviews } from "@/content/reviews";
import Archive from "./Archive";

export const metadata = { title: "Archive — The Broadway Art Ledger" };

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  const back =
    typeof from === "string" && from.length > 0
      ? { href: `/t/${from}`, label: "← Back to the design" }
      : { href: "/designs", label: "← All designs" };

  return <Archive reviews={reviews} backHref={back.href} backLabel={back.label} />;
}
