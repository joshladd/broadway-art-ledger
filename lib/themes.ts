import type { ComponentType } from "react";
import type { Review, SubmitField } from "@/content/reviews";

export type AboutContent = { title: string; lede: string; body: string[] };

export type ThemeMeta = { key: string; name: string; blurb: string };

export type ThemeModule = {
  meta: ThemeMeta;
  Home: ComponentType<{ reviews: Review[]; t: string }>;
  ReviewPage: ComponentType<{ review: Review; prev: Review | null; next: Review | null; t: string }>;
  About: ComponentType<{ about: AboutContent; t: string }>;
  Submit: ComponentType<{ fields: SubmitField[]; t: string; sent: boolean; error: boolean }>;
  // Optional per-theme archive (list view). If absent, /t/<theme>/archive falls
  // back to the shared /archive page.
  Archive?: ComponentType<{ reviews: Review[]; t: string }>;
};

// Theme registry. Each theme is a self-contained folder under themes/<key>/
// exporting a default ThemeModule.
import ledger from "@/themes/ledger";
import kunsthalle from "@/themes/kunsthalle";
import broadside from "@/themes/broadside";
import nocturne from "@/themes/nocturne";
import indexTheme from "@/themes/index";
import marquee from "@/themes/marquee";
import plate from "@/themes/plate";
import riso from "@/themes/riso";
import folio from "@/themes/folio";

export const themeModules: Record<string, ThemeModule> = {
  ledger,
  kunsthalle,
  broadside,
  nocturne,
  index: indexTheme,
  marquee,
  plate,
  riso,
  folio,
};

export const themes: ThemeMeta[] = Object.values(themeModules).map((m) => m.meta);

export function getTheme(key: string): ThemeModule | undefined {
  return themeModules[key];
}
