// Fixed topic list the model picks from, so search can offer a small, stable set of filter chips.
export const TOPICS = ["Design", "Technology", "Business", "Law", "Science", "Arts", "Health", "Everyday"] as const;
export const OTHER_TOPIC = "Other";

export function normaliseTopic(raw: unknown): string {
  if (typeof raw !== "string") return OTHER_TOPIC;
  const match = TOPICS.find((t) => t.toLowerCase() === raw.trim().toLowerCase());
  return match ?? OTHER_TOPIC;
}

export interface WordExplanation {
  meaning: string;
  example: string;
  pronunciation: string;
  partOfSpeech: string;
  topic: string;
  // Up to MAX_SYNONYMS close synonyms; empty when the word has none worth showing.
  synonyms: string[];
}

export const MAX_SYNONYMS = 3;

function normaliseSynonyms(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const s = item.trim();
    if (!s || seen.has(s.toLowerCase())) continue;
    seen.add(s.toLowerCase());
    out.push(s);
    if (out.length === MAX_SYNONYMS) break;
  }
  return out;
}

export function buildExplainPrompt(word: string): string {
  return `Give a concise dictionary-style meaning (at most 12 words, so it fits on two short lines), one natural example sentence (at most 14 words, about 90 characters), an IPA pronunciation, the part of speech, up to ${MAX_SYNONYMS} close synonyms, and the single best-fitting topic for the word or term "${word}". Topic must be exactly one of: ${TOPICS.join(", ")}. Pick the field the term belongs to (for example "design system" or "affordance" is Design, "latency" or "AI workflows" is Technology, "liability" is Law). Use Everyday ONLY for general-purpose words that belong to no specific field. Synonyms must be genuine one-for-one substitutes in the same sense, never merely related words; use an empty list when none fit (common for technical terms, names and idioms) and never pad it. Respond as JSON: {"meaning": "...", "example": "...", "pronunciation": "/.../", "partOfSpeech": "noun", "synonyms": ["..."], "topic": "<one topic from the list>"}. No other text.`;
}

export function parseExplainResponse(raw: string): WordExplanation {
  const parsed = JSON.parse(raw);
  if (typeof parsed.meaning !== "string" || typeof parsed.example !== "string") {
    throw new Error("Malformed explanation response");
  }
  return {
    meaning: parsed.meaning,
    example: parsed.example,
    pronunciation: typeof parsed.pronunciation === "string" ? parsed.pronunciation : "",
    partOfSpeech: typeof parsed.partOfSpeech === "string" ? parsed.partOfSpeech : "",
    topic: normaliseTopic(parsed.topic),
    synonyms: normaliseSynonyms(parsed.synonyms),
  };
}

// `preference` is an optional sentence about the reader (their goal / industry, see profilePreference) that steers the pick.
export function buildWordOfDayPrompt(previousWords: string[], preference?: string): string {
  const exclude = previousWords.length
    ? ` Avoid these already-used words: ${previousWords.join(", ")}.`
    : "";
  const audience = preference ? ` ${preference} Choose a word that suits them.` : "";
  return `Pick one interesting English word suitable for a "word of the day" feature (moderately advanced, not obscure jargon).${audience}${exclude} Respond as JSON: {"word": "..."}. No other text.`;
}

export function parseWordOfDayResponse(raw: string): string {
  const parsed = JSON.parse(raw);
  if (typeof parsed.word !== "string" || !parsed.word.trim()) {
    throw new Error("Malformed word-of-day response");
  }
  return parsed.word.trim();
}
