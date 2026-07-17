import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";

// Flat config for Next 16 (the old `next lint` command was removed).
// eslint-config-next ships native flat-config arrays, so no FlatCompat.
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "scripts/**", "*.mjs"],
  },
  ...next,
  ...ts,
];

export default eslintConfig;
