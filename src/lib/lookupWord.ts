import { isLookupCandidate } from "../content/selectionRules";
import type { ModelClient } from "./modelClient";
import type { CompactWordRecord, FullWordDetail } from "./types";

export interface LookupWordDeps {
  model: ModelClient;
  wordStore: { getAllWords(): Promise<CompactWordRecord[]> };
  detailCache: {
    getDetail(word: string): Promise<FullWordDetail | undefined>;
    setDetail(d: FullWordDetail): Promise<void>;
  };
  today: () => string;
}

export interface WordLookup {
  meaning: string;
  partOfSpeech: string;
  pronunciation: string;
  saved: boolean; // already in the library
}

// Powers the highlight popover: what does this word mean, before the reader decides to save it. The same
// selection rule the popover uses is enforced here too, so numbers and symbols can never cost a model call even
// if a caller forgets to check. Anything already saved or cached is answered without calling the model; a fresh
// explanation is cached (not saved) so that pressing "Add to my library" afterwards doesn't ask again.
export async function lookupWord(deps: LookupWordDeps, rawWord: string): Promise<WordLookup> {
  const word = rawWord.trim();
  if (!isLookupCandidate(word)) throw new Error("That isn't a word Lexi can look up.");

  const saved = (await deps.wordStore.getAllWords()).find((w) => w.word.toLowerCase() === word.toLowerCase());
  const cached = await deps.detailCache.getDetail(word);
  if (cached) {
    return { meaning: cached.meaning, partOfSpeech: cached.partOfSpeech, pronunciation: cached.pronunciation, saved: !!saved };
  }
  if (saved) {
    return { meaning: saved.shortMeaning, partOfSpeech: "", pronunciation: "", saved: true };
  }

  const explanation = await deps.model.explainWord(word);
  await deps.detailCache.setDetail({
    word,
    meaning: explanation.meaning,
    example: explanation.example,
    pronunciation: explanation.pronunciation,
    partOfSpeech: explanation.partOfSpeech,
    synonyms: explanation.synonyms,
    topic: explanation.topic,
    cachedAt: deps.today(),
  });
  return { meaning: explanation.meaning, partOfSpeech: explanation.partOfSpeech, pronunciation: explanation.pronunciation, saved: false };
}
