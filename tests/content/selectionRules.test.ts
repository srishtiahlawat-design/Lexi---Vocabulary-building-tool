import { describe, it, expect } from "vitest";
import { countWords, hasWordContent, isLookupCandidate } from "../../src/content/selectionRules";

describe("countWords", () => {
  it("counts whitespace-separated words, ignoring surrounding and repeated whitespace", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("serendipity")).toBe(1);
    expect(countWords("  design   system \n")).toBe(2);
    expect(countWords("assess your design system")).toBe(4);
  });
});

describe("isLookupCandidate", () => {
  it("accepts one word", () => {
    expect(isLookupCandidate("serendipity")).toBe(true);
  });

  it("accepts two words, including across a line break", () => {
    expect(isLookupCandidate("design system")).toBe(true);
    expect(isLookupCandidate("design\nsystem")).toBe(true);
  });

  it("treats hyphenated and apostrophe words as one word", () => {
    expect(isLookupCandidate("well-known")).toBe(true);
    expect(isLookupCandidate("system's")).toBe(true);
  });

  it("rejects three or more words so copying a phrase or sentence never shows the popover", () => {
    expect(isLookupCandidate("assess your design")).toBe(false);
    expect(isLookupCandidate("assess your design system's health and identify")).toBe(false);
  });

  it("still rejects empty, single-character and over-long selections", () => {
    expect(isLookupCandidate("")).toBe(false);
    expect(isLookupCandidate("   ")).toBe(false);
    expect(isLookupCandidate("a")).toBe(false);
    expect(isLookupCandidate("x".repeat(61))).toBe(false);
  });
});

describe("numbers and symbols", () => {
  it("never offers a lookup for numbers, symbols or number-plus-unit selections", () => {
    for (const text of ["22", "2024", "3.5", "$100", "2024-10-07", "24/7", "1st", "10th", "5km", "100ms", "10px", "3D", "A4", "x2", "--", "!!", "@#", "12 34"]) {
      expect(isLookupCandidate(text), text).toBe(false);
    }
  });

  it("allows a number that is part of a real word or concept", () => {
    for (const text of ["catch 22", "Catch-22", "COVID-19", "H2O", "B2B", "Windows 11", "Y2K", "web3"]) {
      expect(isLookupCandidate(text), text).toBe(true);
    }
  });

  it("hasWordContent needs a token with two real letters", () => {
    expect(hasWordContent("22")).toBe(false);
    expect(hasWordContent("catch 22")).toBe(true);
    expect(hasWordContent("5 km")).toBe(false);
  });
});
