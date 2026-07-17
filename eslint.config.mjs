import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";

// Flat config for Next 16 (the old `next lint` command was removed).
// eslint-config-next ships native flat-config arrays, so no FlatCompat.
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "scripts/**", "*.mjs", "sanity.types.ts"],
  },
  ...next,
  ...ts,
  {
    // `_`-prefixed identifiers are intentional throwaways (e.g. the compile-time
    // query/type binding assertions in map-review.ts and site-content.ts).
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
      ],
    },
  },
];

export default eslintConfig;
