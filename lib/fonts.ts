// Self-hosted, preloaded fonts (no cross-origin request, no render-blocking).
// The three faces the design uses: Fraunces (display), Newsreader (body),
// Space Mono (meta/labels).
import { Fraunces, Newsreader, Space_Mono } from "next/font/google";

// axes: ["opsz"] keeps the optical-size axis so `font-optical-sizing: auto`
// engages Fraunces' display cut (refined large titles + its swash ampersand).
const fraunces = Fraunces({ subsets: ["latin"], variable: "--f-fraunces", display: "swap", style: ["normal", "italic"], axes: ["opsz"] });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--f-newsreader", display: "swap", style: ["normal", "italic"], axes: ["opsz"] });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-mono", display: "swap" });

export const fontVars = [fraunces, newsreader, spaceMono].map((f) => f.variable).join(" ");
