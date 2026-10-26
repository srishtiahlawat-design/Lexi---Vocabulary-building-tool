import type { ModelClient } from "./modelClient";
import type { CompactWordRecord, FullWordDetail } from "./types";

export interface AddWordDeps {
  model: ModelClient;
  wordStore: {
    getAllWords(): Promise<CompactWordRecord[]>;
    saveWord(r: CompactWordRecord): Promise<CompactWordRecord>;
  };
  detailCache: {
    getDetail(word: string): Promise<FullWordDetail | undefined>;
    setDetail(d: FullWordDetail): Promise<void>;
  };
  today: () => string;
}

export async function addWord(deps: AddWordDeps, rawWord: string): Promise<CompactWordRecord> {
  const word = rawWord.trim();
  if (!word) throw new Error("Empty word");

  const existing = (await deps.wordStore.getAllWords()).find(
    (w) => w.word.toLowerCase() === word.toLowerCase()
  );
  if (existing) return existing;

  // A highlight lookup (see lookupWord.ts) may already have explained this word; reuse that instead of paying
  // for a second model call. Details cached before topics were stored have no topic, so those ask again.
  const cached = await deps.detailCache.getDetail(word);
  const explanation =
    cached && cached.topic
      ? {
          meaning: cached.meaning,
          example: cached.example,
          pronunciation: cached.pronunciation,
          partOfSpeech: cached.partOfSpeech,
          topic: cached.topic,
          synonyms: cached.synonyms ?? [],
        }
      : await deps.model.explainWord(word);
  const record: CompactWordRecord = {
    word,
    shortMeaning: explanation.meaning,
    savedDate: deps.today(),
    source: "manual",
    quizStats: { seen: 0, known: 0 },
    topic: explanation.topic,
  };
  await deps.wordStore.saveWord(record);
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
  return record;
}
