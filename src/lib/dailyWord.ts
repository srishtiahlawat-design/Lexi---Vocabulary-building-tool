import type { StorageArea } from "./storage";

const TODAY_WORD_KEY = "lexi.todayWord"; // sync — shared across your devices
export const SHOWN_WORDS_KEY = "lexi.shownDailyWords"; // sync — every daily word ever shown, saved or not
// Chrome caps one sync item at 8KB; ~400 short words fits with room to spare. Oldest drop off first.
const MAX_SHOWN_WORDS = 400;
const LAST_SHOWN_KEY = "lexi.lastShownDate"; // local — per device

export interface TodayWordRecord {
  date: string;
  word: string;
  // Carried here (rather than looked up again) because the word isn't written to wordStore until it's actually
  // saved - see saveTodayWord() in wordOfDayService.ts.
  topic?: string;
}

export function createTodayWordStore(syncArea: StorageArea) {
  async function getTodayWord(): Promise<TodayWordRecord | null> {
    const data = await syncArea.get(TODAY_WORD_KEY);
    return (data[TODAY_WORD_KEY] as TodayWordRecord) ?? null;
  }
  async function setTodayWord(record: TodayWordRecord): Promise<void> {
    await syncArea.set({ [TODAY_WORD_KEY]: record });
  }
  return { getTodayWord, setTodayWord };
}

export function createLastShownStore(localArea: StorageArea) {
  async function getLastShownDate(): Promise<string | null> {
    const data = await localArea.get(LAST_SHOWN_KEY);
    return (data[LAST_SHOWN_KEY] as string) ?? null;
  }
  async function setLastShownDate(date: string): Promise<void> {
    await localArea.set({ [LAST_SHOWN_KEY]: date });
  }
  return { getLastShownDate, setLastShownDate };
}

// Every word of the day that has been picked, whether or not the user saved it. This is what keeps an ignored word
// from coming back: the library only knows the saved ones.
export function createShownWordsStore(syncArea: StorageArea) {
  async function getShownWords(): Promise<string[]> {
    const data = await syncArea.get(SHOWN_WORDS_KEY);
    return (data[SHOWN_WORDS_KEY] as string[]) ?? [];
  }
  async function addShownWord(word: string): Promise<void> {
    const words = await getShownWords();
    if (words.some((w) => w.toLowerCase() === word.toLowerCase())) return;
    await syncArea.set({ [SHOWN_WORDS_KEY]: [...words, word].slice(-MAX_SHOWN_WORDS) });
  }
  return { getShownWords, addShownWord };
}
