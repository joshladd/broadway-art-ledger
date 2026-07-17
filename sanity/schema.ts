import type { SchemaTypeDefinition } from "sanity";
import { review } from "./schemas/review";
import { siteSettings } from "./schemas/siteSettings";
import { aboutPage } from "./schemas/aboutPage";
import { submitPage } from "./schemas/submitPage";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [review, siteSettings, aboutPage, submitPage],
};
