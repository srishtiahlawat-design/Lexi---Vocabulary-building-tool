import { describe, it, expect } from "vitest";
import { groupByWeek } from "../../src/sidepanel/weeks";
import type { CompactWordRecord } from "../../src/lib/types";

const NOW = new Date(2026, 9, 26, 12, 0, 0); // 26 Oct 2026

function word(name: string, savedDate: string): CompactWordRecord {
  return { word: name, shortMeaning: "m", savedDate, source: "manual", quizStats: { seen: 0, known: 0 } };
}

describe("groupByWeek", () => {
  it("puts words into this week, last week and earlier, newest first within each", () => {
    const groups = groupByWeek(
      [word("a", "2026-10-26"), word("b", "2026-10-20"), word("c", "2026-10-19"), word("d", "2026-10-12"), word("e", "2026-10-06")],
      NOW
    );
    expect(groups.map((g) => g.label)).toEqual(["This week", "Last week", "Earlier"]);
    expect(groups.map((g) => g.words.map((w) => w.word))).toEqual([["a", "b"], ["c"], ["d", "e"]]);
  });

  it("leaves out words older than three weeks", () => {
    const groups = groupByWeek([word("old", "2026-09-01")], NOW);
    expect(groups).toHaveLength(1);
    expect(groups[0].words).toEqual([]);
  });

  it("always lists this week, even with no words, but only lists other weeks that have words", () => {
    const groups = groupByWeek([word("x", "2026-10-15")], NOW);
    expect(groups.map((g) => g.label)).toEqual(["This week", "Last week"]);
    expect(groups[0].words).toEqual([]);
  });

  it("treats a future or same-day date as this week", () => {
    const groups = groupByWeek([word("today", "2026-10-26"), word("future", "2026-10-28")], NOW);
    expect(groups[0].words.map((w) => w.word)).toEqual(["today", "future"]);
  });
});
