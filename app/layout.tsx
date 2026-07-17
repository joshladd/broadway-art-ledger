import type { Metadata } from "next";
import "./globals.css";
import { fontVars } from "@/lib/fonts";
import { strap } from "@/content/site";

export const metadata: Metadata = {
  title: "The Broadway Art Ledger",
  description: strap,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
