import type { Metadata } from "next";
import { fontVars } from "@/lib/fonts";
import { strap } from "@/content/site";

// NOTE: globals.css is intentionally imported in app/(site)/layout.tsx, not
// here, so the site reset never reaches the embedded Studio at /studio.

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
