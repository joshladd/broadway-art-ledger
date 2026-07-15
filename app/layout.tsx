import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Broadway Art Ledger",
  description: "Art criticism for the New York metropolitan area. Every review between 200 and 400 words.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Instrument+Serif:ital@0;1&family=Syne:wght@400..800&family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=Archivo:ital,wght@0,100..900;1,100..900&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
