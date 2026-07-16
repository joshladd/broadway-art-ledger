import { getReviews } from "@/lib/reviews-data";
import Archive from "./Archive";

export const revalidate = 15;

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
      : { href: "/", label: "← All designs" };

  const reviews = await getReviews();

  return <Archive reviews={reviews} backHref={back.href} backLabel={back.label} />;
}
