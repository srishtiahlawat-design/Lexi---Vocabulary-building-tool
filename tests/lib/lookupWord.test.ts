import { describe, it, expect, vi } from "vitest";
import { createWordStore } from "../../src/lib/storage";
import { createDetailCache } from "../../src/lib/cache";
import { createFakeStorageArea } from "../mocks/fakeStorageArea";
import { lookupWord } from "../../src/lib/lookupWord";
import type { ModelClient } from "../../src/lib/modelClient";

function makeDeps() {
  const wordStore = createWordStore(createFakeStorageArea());
  const detailCache = createDetailCache(createFakeStorageArea());
  const model: ModelClient = {
    pickWordOfDay: vi.fn(),
    explainWord: vi.fn().mockResolvedValue({
      meaning: "lasting a short time", example: "It was ephemeral.", pronunciation: "/x/",
      partOfSpeech: "adjective", topic: "Everyday", synonyms: ["fleeting"],
    }),
  };
  return { model, wordStore, detailCache, today: () => "2026-10-07" };
}

describe("lookupWord", () => {
  it("never calls the model for numbers or symbols", async () => {
    const deps = makeDeps();
    for (const text of ["22", "2024", "$100", "5km", "1st", "A4", "!!", "   "]) {
      await expect(lookupWord(deps, text), text).rejects.toThrow();
    }
    expect(deps.model.explainWord).not.toHaveBeenCalled();
  });

  it("does look up a term that contains a number", async () => {
    const deps = makeDeps();
    await lookupWord(deps, "catch 22");
    expect(deps.model.explainWord).toHaveBeenCalledWith("catch 22");
  });

  it("explains an unknown word and caches it without saving it", async () => {
    const deps = makeDeps();
    const result = await lookupWord(deps, "ephemeral");
    expect(result).toMatchObject({ meaning: "lasting a short time", partOfSpeech: "adjective", saved: false });
    expect(await deps.wordStore.getAllWords()).toHaveLength(0);
    expect((await deps.detailCache.getDetail("ephemeral"))?.synonyms).toEqual(["fleeting"]);
  });

  it("answers a repeat lookup from the cache with no second model call", async () => {
    const deps = makeDeps();
    await lookupWord(deps, "ephemeral");
    await lookupWord(deps, "Ephemeral");
    expect(deps.model.explainWord).toHaveBeenCalledOnce();
  });

  it("reports a saved word as saved, without calling the model", async () => {
    const deps = makeDeps();
    await deps.wordStore.saveWord({ word: "lucid", shortMeaning: "clear", savedDate: "2026-10-01", source: "manual", quizStats: { seen: 0, known: 0 } });
    const result = await lookupWord(deps, "lucid");
    expect(result).toMatchObject({ meaning: "clear", saved: true });
    expect(deps.model.explainWord).not.toHaveBeenCalled();
  });
});
