// Decides whether a text selection should offer "Add to my library". Lexi is for looking up single words
// (or a two-word term like "design system"), so longer selections - a sentence someone is copying,
// quoting or highlighting for their own reasons - must never trigger the popover.
export const MIN_LEN = 2;
export const MAX_LEN = 60;
export const MAX_WORDS = 2;

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

// A token that is just a number, possibly dressed up: "22", "3.5", "$100", "2024-10-07", "24/7", "1st", "5km", "10px".
// These are quantities, not terms, so on their own they are never worth a lookup.
const UNITS = "st|nd|rd|th|k|m|b|kg|km|cm|mm|ms|px|pt|em|rem|gb|mb|kb|tb|hz|am|pm|x|s|d|h|g|l";
const NUMERIC_TOKEN = new RegExp(`^[^\\p{L}\\d]*\\d[\\d.,:%/+\\-]*(?:${UNITS})?[^\\p{L}\\d]*$`, "iu");
const UNIT_ONLY = new RegExp(`^(?:${UNITS})$`, "i"); // "5 km": the unit after a separate number

// Numbers and symbols alone never qualify (no popover, no model call). A number only gets through as part of a
// real term - "catch 22", "Catch-22", "COVID-19", "H2O", "Windows 11" - i.e. when some token carries at least two
// letters that aren't just a unit or ordinal suffix on a number ("5km", "1st", "3D", "A4").
export function hasWordContent(text: string): boolean {
  const tokens = text.trim().split(/\s+/);
  return tokens.some((token, i) => {
    if (NUMERIC_TOKEN.test(token)) return false;
    if (i > 0 && NUMERIC_TOKEN.test(tokens[i - 1]) && UNIT_ONLY.test(token)) return false;
    return (token.match(/\p{L}/gu)?.length ?? 0) >= 2;
  });
}

export function isLookupCandidate(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < MIN_LEN || trimmed.length > MAX_LEN) return false;
  return countWords(trimmed) <= MAX_WORDS && hasWordContent(trimmed);
}
