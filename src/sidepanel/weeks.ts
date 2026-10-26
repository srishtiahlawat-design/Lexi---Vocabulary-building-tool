import type { CompactWordRecord } from "../lib/types";

export interface WeekGroup {
  label: string;
  words: CompactWordRecord[];
}

// How many weeks of words the library shows; older words are still there, and one search away.
export const WEEKS_SHOWN = 3;

const WEEK_LABELS = ["This week", "Last week", "Earlier"];

// Splits the library (newest first) into the weeks the home screen lists: this week (the last 7 days), last week
// (7 to 13 days ago) and earlier (14 to 20 days ago). "This week" is always there, so an empty week still says so;
// the other groups only appear when they have words. Words older than WEEKS_SHOWN weeks are left out.
export function groupByWeek(words: CompactWordRecord[], now: Date = new Date()): WeekGroup[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const DAY = 24 * 60 * 60 * 1000;
  const groups: WeekGroup[] = WEEK_LABELS.map((label) => ({ label, words: [] }));
  for (const w of words) {
    const saved = new Date(w.savedDate);
    const savedDay = new Date(saved.getUTCFullYear(), saved.getUTCMonth(), saved.getUTCDate()).getTime();
    const daysAgo = Math.floor((startOfToday - savedDay) / DAY);
    const week = Math.floor(Math.max(daysAgo, 0) / 7);
    if (week < WEEKS_SHOWN) groups[week].words.push(w);
  }
  return groups.filter((g, i) => i === 0 || g.words.length > 0);
}
