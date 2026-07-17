import next from "eslint-config-next/core-web-vitals";
import ts from "eslint-config-next/typescript";

// Flat config for Next 16 (the old `next lint` command was removed).
// eslint-config-next ships native flat-config arrays, so no FlatCompat.
//
// Linting is scoped to the production product; the frozen design exploration
// (themes/, lab/, app/(site)/{designs,lab,t}) and one-off scripts are excluded —
// they are not shipped product code and aren't worth gating CI on.
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "themes/**",
      "lab/**",
      "app/(site)/designs/**",
      "app/(site)/lab/**",
      "app/(site)/t/**",
      "content/reviews.ts",
      "content/reviews-fixture.ts",
      "components/Switcher.tsx",
      "components/LabSwitcher.tsx",
      "scripts/**",
      "*.mjs",
    ],
  },
  ...next,
  ...ts,
];

export default eslintConfig;
