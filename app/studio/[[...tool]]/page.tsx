import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export const dynamic = "force-static";
export const metadata = { title: "Studio — The Broadway Art Ledger" };

export default function StudioPage() {
  return <NextStudio config={config} />;
}
