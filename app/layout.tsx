import type { Metadata } from "next";
import "./globals.css";
import { fontVars } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "The Broadway Art Ledger",
  description: "Art criticism for the New York metropolitan area. Every review between 200 and 400 words.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
