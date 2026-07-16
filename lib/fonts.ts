// Self-hosted, preloaded fonts (no cross-origin request, no render-blocking).
// Only the four faces the themes actually use.
import { Fraunces, Newsreader, Archivo, Space_Mono } from "next/font/google";

// axes: ["opsz"] keeps the optical-size axis so `font-optical-sizing: auto`
// engages Fraunces' display cut (refined large titles + its swash ampersand).
const fraunces = Fraunces({ subsets: ["latin"], variable: "--f-fraunces", display: "swap", style: ["normal", "italic"], axes: ["opsz"] });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--f-newsreader", display: "swap", style: ["normal", "italic"], axes: ["opsz"] });
const archivo = Archivo({ subsets: ["latin"], variable: "--f-archivo", display: "swap" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-mono", display: "swap" });

export const fontVars = [fraunces, newsreader, archivo, spaceMono].map((f) => f.variable).join(" ");
