"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schema";

// Studio is embedded in the Next app at /studio, so Bryan edits at
// <domain>/studio with no separate deploy. It reads the same
// NEXT_PUBLIC_SANITY_DATASET as the site: local edits `development`, the
// deployed Studio edits `production`.
export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [structureTool(), visionTool({ defaultApiVersion: apiVersion })],
});
