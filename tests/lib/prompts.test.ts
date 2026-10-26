import { describe, it, expect } from "vitest";
import {
  buildExplainPrompt,
  parseExplainResponse,
  buildWordOfDayPrompt,
  parseWordOfDayResponse,
  normaliseTopic,
  TOPICS,
} from "../../src/lib/prompts";

describe("prompt builders and parsers", () => {
  it("includes the word in the explain prompt", () => {
    expect(buildExplainPrompt("ephemeral")).toContain("ephemeral");
  });

  it("asks the model to pick a topic from the fixed list", () => {
    const prompt = buildExplainPrompt("ephemeral");
    for (const topic of TOPICS) expect(prompt).toContain(topic);
  });

  it("parses a valid explain response", () => {
    const result = parseExplainResponse(
      '{"meaning":"lasting a short time","example":"It was ephemeral.","pronunciation":"/əˈfem(ə)rəl/","partOfSpeech":"adjective","topic":"Everyday"}'
    );
    expect(result).toEqual({
      meaning: "lasting a short time",
      example: "It was ephemeral.",
      pronunciation: "/əˈfem(ə)rəl/",
      partOfSpeech: "adjective",
      topic: "Everyday",
      synonyms: [],
    });
  });

  it("defaults pronunciation and part of speech to empty strings when the model omits them", () => {
    const result = parseExplainResponse('{"meaning":"lasting a short time","example":"It was ephemeral."}');
    expect(result).toEqual({
      meaning: "lasting a short time",
      example: "It was ephemeral.",
      pronunciation: "",
      partOfSpeech: "",
      topic: "Other",
      synonyms: [],
    });
  });

  it("normalises the topic to the fixed list and falls back to Other", () => {
    expect(normaliseTopic("technology")).toBe("Technology");
    expect(normaliseTopic(" Design ")).toBe("Design");
    expect(normaliseTopic("astrology")).toBe("Other");
    expect(normaliseTopic(undefined)).toBe("Other");
  });

  it("asks for at most three synonyms and allows none", () => {
    const prompt = buildExplainPrompt("ephemeral");
    expect(prompt).toContain("up to 3");
    expect(prompt).toContain("empty list");
  });

  it("keeps at most three clean, de-duplicated synonyms", () => {
    const raw = '{"meaning":"m","example":"e","synonyms":["fleeting"," Transient ","transient","brief","short-lived",3,""]}';
    expect(parseExplainResponse(raw).synonyms).toEqual(["fleeting", "Transient", "brief"]);
  });

  it("treats missing or malformed synonyms as none", () => {
    expect(parseExplainResponse('{"meaning":"m","example":"e","synonyms":"fleeting"}').synonyms).toEqual([]);
    expect(parseExplainResponse('{"meaning":"m","example":"e","synonyms":[]}').synonyms).toEqual([]);
  });

  it("throws on a malformed explain response", () => {
    expect(() => parseExplainResponse('{"meaning":"only"}')).toThrow();
  });

  it("excludes previously used words from the word-of-day prompt", () => {
    const prompt = buildWordOfDayPrompt(["ephemeral", "lucid"]);
    expect(prompt).toContain("ephemeral");
    expect(prompt).toContain("lucid");
  });

  it("parses and trims a valid word-of-day response", () => {
    expect(parseWordOfDayResponse('{"word":" lucid "}')).toBe("lucid");
  });

  it("throws on a malformed word-of-day response", () => {
    expect(() => parseWordOfDayResponse('{"word":""}')).toThrow();
  });
});
