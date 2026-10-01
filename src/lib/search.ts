/**
 * Lightweight text matching used by the local search implementation.
 * A hosted backend (Algolia, Typesense, Postgres FTS…) can replace this
 * without changing the service signatures.
 */

const STOP_WORDS = new Set(['in', 'at', 'near', 'the', 'and', 'of', 'for', 'a', 'an', 'me', 'best', 'top', 'shop', 'shops']);

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9஀-௿]+/g, ' ')
    .trim();
}

/** Very small English stemmer — enough to match "clinics" with "clinic". */
export function stem(token: string): string {
  if (token.length <= 3) return token;
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('sses')) return token.slice(0, -2);
  if (token.endsWith('es') && /(ch|sh|x|ss)es$/.test(token)) return token.slice(0, -2);
  if (token.endsWith('s') && !token.endsWith('ss') && !token.endsWith('us')) return token.slice(0, -1);
  return token;
}

export function tokenize(value: string, { dropStopWords = false } = {}): string[] {
  const tokens = normalize(value).split(' ').filter(Boolean);
  return (dropStopWords ? tokens.filter((t) => !STOP_WORDS.has(t)) : tokens).map(stem);
}

/** True when every query token prefix-matches at least one haystack token. */
export function matchesAll(queryTokens: string[], haystackTokens: string[]): boolean {
  return queryTokens.every((q) => haystackTokens.some((h) => h.startsWith(q)));
}

/** Scores how well a query matches a single field (0 = no match). */
export function fieldScore(queryTokens: string[], fieldTokens: string[]): number {
  if (!queryTokens.length || !fieldTokens.length) return 0;
  let score = 0;
  for (const q of queryTokens) {
    if (fieldTokens.includes(q)) score += 3;
    else if (fieldTokens.some((f) => f.startsWith(q))) score += 2;
  }
  return score;
}

/** Wraps matching segments in <mark>-ready parts for highlighting. */
export function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const terms = normalize(query).split(' ').filter((t) => t.length > 1);
  if (!terms.length) return [{ text, match: false }];
  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({ text: part, match: terms.some((t) => part.toLowerCase() === t) }));
}
