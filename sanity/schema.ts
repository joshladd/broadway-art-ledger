import type { SchemaTypeDefinition } from "sanity";
import { review } from "./schemas/review";

export const schema: { types: SchemaTypeDefinition[] } = { types: [review] };
