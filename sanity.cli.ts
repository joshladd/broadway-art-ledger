import { defineCliConfig } from "sanity/cli";

// Config for the Sanity CLI. Used by typegen (`npm run typegen`): it extracts
// the schema from sanity.config.ts and generates sanity.types.ts — the exact
// result type of each defineQuery, so a projection/type mismatch is a compile
// error. The project id/dataset are public and only contextual here; typegen
// itself is an offline schema + query analysis.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "6vag9i62",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "development",
  },
});
