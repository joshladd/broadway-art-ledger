// Search-term handling, shared across the client/server RPC boundary. The server
// splits the query to build a GROQ match pattern; the client splits the same
// string to know what to highlight. They must agree, so both use these — and the
// term bounding keeps a public search call from fanning out into a giant match.

export const MAX_QUERY_LENGTH = 100;
export const MAX_TERMS = 10;

// Normalize a raw search string into bounded, prefix-matchable terms. Empty when
// there's nothing to search.
export function parseSearchTerms(query: string): string[] {
  return query
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_TERMS);
}

// The GROQ `match` pattern for a set of terms — each prefix-matched.
export function buildSearchPattern(terms: string[]): string {
  return terms.map((w) => `${w}*`).join(" ");
}

export type Segment = { value: string; match: boolean };

// Split `text` into segments, flagging which coincide with a search term (for
// wrapping matches in <mark>). Terms are regex-escaped so a query like "c++"
// can't break the pattern (no ReDoS: the result is a literal alternation).
export function splitOnTerms(text: string, terms: string[]): Segment[] {
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).filter(Boolean);
  if (escaped.length === 0) return [{ value: text, match: false }];
  // split with one capture group -> odd indices are the matches.
  return text
    .split(new RegExp(`(${escaped.join("|")})`, "gi"))
    .map((value, i) => ({ value, match: i % 2 === 1 }));
}
