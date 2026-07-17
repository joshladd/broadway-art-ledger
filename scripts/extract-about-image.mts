// One-off: decode Bryan's About image out of his markdown into a real asset.
// He explicitly asked for this image on the About page. The blob is a base64
// PNG embedded as a markdown reference-link at the end of the source file.
//
// Run: node --import tsx scripts/extract-about-image.mts
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "The Broadway Art Ledger.md";
const OUT = "public/about.png";

const md = readFileSync(SRC, "utf8");
const m = /\[image1\]:\s*<?data:image\/png;base64,([A-Za-z0-9+/=\s]+?)>?\s*$/m.exec(md);
if (!m) throw new Error(`image1 data-URI not found in ${SRC}`);

const buf = Buffer.from(m[1].replace(/\s+/g, ""), "base64");

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!buf.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("decoded blob is not a PNG");
}

// IHDR carries the true dimensions — needed for next/image.
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

writeFileSync(OUT, buf);
console.log(`wrote ${OUT} — ${buf.length} bytes, ${width}x${height}`);
