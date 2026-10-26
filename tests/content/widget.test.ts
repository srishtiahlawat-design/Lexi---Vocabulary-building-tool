import { describe, it, expect, vi } from "vitest";
import { renderWidget, fitWord, u, WORD_SIZES } from "../../src/content/widget";

function makeHandlers() {
  return { onClose: vi.fn(), onToggleCollapse: vi.fn(), onSave: vi.fn().mockResolvedValue(undefined) };
}

function makeData(overrides: Partial<Parameters<typeof renderWidget>[1]> = {}) {
  return {
    word: "ephemeral",
    meaning: "lasting a short time",
    example: "The joy was ephemeral.",
    pronunciation: "/əˈfem(ə)rəl/",
    partOfSpeech: "adjective",
    ...overrides,
  };
}

describe("renderWidget", () => {
  it("shows a Similar row of hand-drawn chips, and leaves it out when the word has no synonyms", () => {
    const withChips = document.createElement("div").attachShadow({ mode: "open" });
    renderWidget(withChips, makeData({ synonyms: ["fleeting", "brief", "passing"] }), makeHandlers(), false);
    const similar = withChips.querySelector(".similar") as HTMLElement;
    expect(similar.hidden).toBe(false);
    expect(Array.from(similar.querySelectorAll(".chip")).map((c) => c.textContent)).toEqual(["fleeting", "brief", "passing"]);
    expect(similar.querySelectorAll(".chip svg path")).toHaveLength(3);

    const without = document.createElement("div").attachShadow({ mode: "open" });
    renderWidget(without, makeData(), makeHandlers(), false);
    expect((without.querySelector(".similar") as HTMLElement).hidden).toBe(true);
    expect(without.querySelectorAll(".chip")).toHaveLength(0);
  });

  it("puts the Example heading at the start of the sentence's paragraph", () => {
    const root = document.createElement("div").attachShadow({ mode: "open" });
    renderWidget(root, makeData(), makeHandlers(), false);
    const wrap = root.querySelector(".exampleWrap") as HTMLElement;
    expect(wrap.firstElementChild?.className).toBe("exampleLabel");
    expect(wrap.textContent).toBe("ExampleThe joy was ephemeral.");
  });

  it("renders the word, pronunciation, part of speech, meaning, and example when expanded", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    renderWidget(root, makeData(), makeHandlers(), false);

    expect(root.querySelector(".word")?.textContent).toBe("ephemeral");
    expect(root.querySelector(".ipa")?.textContent).toBe("/əˈfem(ə)rəl/");
    expect(root.querySelector(".pos")?.textContent).toBe("adjective");
    expect(root.querySelector(".meaning")?.textContent).toBe("lasting a short time");
    expect(root.querySelector(".example")?.textContent).toBe("The joy was ephemeral.");
  });

  it("hides the pronunciation row when there's no pronunciation or part of speech", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    renderWidget(root, makeData({ pronunciation: "", partOfSpeech: "" }), makeHandlers(), false);

    expect((root.querySelector(".pron") as HTMLElement).hidden).toBe(true);
  });

  it("calls onClose when the close button is clicked", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    const handlers = makeHandlers();
    renderWidget(root, makeData(), handlers, false);

    (root.querySelector(".closeBtn") as HTMLElement).click();
    expect(handlers.onClose).toHaveBeenCalledOnce();
  });

  it("calls onToggleCollapse when the minimize button is clicked", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    const handlers = makeHandlers();
    renderWidget(root, makeData(), handlers, false);

    (root.querySelector(".minimizeBtn") as HTMLElement).click();
    expect(handlers.onToggleCollapse).toHaveBeenCalledOnce();
  });

  it("calls onSave and shows a saved state when the save button is clicked", async () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    const handlers = makeHandlers();
    renderWidget(root, makeData(), handlers, false);

    const saveBtn = root.querySelector(".saveBtn") as HTMLButtonElement;
    saveBtn.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(handlers.onSave).toHaveBeenCalledOnce();
    expect(saveBtn.classList.contains("saved")).toBe(true);
    expect(saveBtn.textContent).toContain("Added to my library");
  });

  it("shows an error and re-enables the button when onSave rejects", async () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    const handlers = { ...makeHandlers(), onSave: vi.fn().mockRejectedValue(new Error("no key")) };
    renderWidget(root, makeData(), handlers, false);

    const saveBtn = root.querySelector(".saveBtn") as HTMLButtonElement;
    saveBtn.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(saveBtn.disabled).toBe(false);
    expect(root.querySelector(".widgetErr")?.textContent).toBe("no key");
  });

  it("renders only the word in a pill when collapsed", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    renderWidget(root, makeData(), makeHandlers(), true);

    expect(root.querySelector(".pillWord")?.textContent).toBe("ephemeral");
    expect(root.querySelector(".card")).toBeNull();
  });

  it("has no word-number row: the finalised widget goes straight from header to word", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    renderWidget(root, makeData(), makeHandlers(), false);
    expect(root.querySelector(".num")).toBeNull();
    const content = root.querySelector(".content") as HTMLElement;
    expect(content.firstElementChild?.className).toBe("word");
  });

  it("draws the canvas notebook paper: ruled lines on a whole 36px pitch and a red margin line", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    renderWidget(root, makeData(), makeHandlers(), false);
    const css = root.querySelector("style")!.textContent!;
    expect(css).toContain("transparent 0 35px, var(--rule) 35px 36px");
    expect(css).toContain(`left: ${u(40)}`); // the margin line sits 40 canvas px from the left
    expect(css).toContain(`top: ${u(116)}`); // lines start 32 canvas px under the 84px header
  });

  it("uses the bundled fonts: Klee One for the word, Geist for the labels, meaning and part of speech", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    renderWidget(root, makeData(), makeHandlers(), false);
    const css = root.querySelector("style")!.textContent!;
    expect(css).toContain("--serif: 'Lexi Klee One'");
    expect(css).toContain("--sans: 'Lexi Geist'");
    expect(css).toMatch(/\.meaning \{[^}]*font-family: var\(--sans\)/);
    expect(css).toMatch(/\.pos \{[^}]*font-family: var\(--sans\)/);
    expect(css).not.toContain("fonts.googleapis.com");
  });

  it("shrinks a word that is too wide for the card", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    renderWidget(root, makeData({ word: "uncharacteristically" }), makeHandlers(), false);
    const card = root.querySelector(".card") as HTMLElement;
    const column = card.querySelector(".content") as HTMLElement;
    const wordEl = card.querySelector(".word") as HTMLElement;
    const wordText = card.querySelector(".wordText") as HTMLElement;

    // a 480 canvas-px card: its text column is the width minus the 58 + 35 canvas-px paddings
    Object.defineProperty(column, "clientWidth", { value: parseFloat(u(480)), configurable: true });
    const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
      // the text is wider the larger the word's font-size is
      const size = parseFloat(wordEl.style.fontSize || u(WORD_SIZES[0]));
      return { width: this === wordText ? size * 8 : 0, height: 0 } as DOMRect;
    });
    fitWord(card);
    spy.mockRestore();

    expect(wordEl.style.fontSize).toBe(u(44)); // 54 and 49 are too wide, 44 is the first that fits
  });

  it("adds the slide-in class only when asked to animate", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });

    renderWidget(root, makeData(), makeHandlers(), false);
    expect(root.querySelector(".card")?.classList.contains("enter")).toBe(false);

    renderWidget(root, makeData(), makeHandlers(), false, { animate: true });
    expect(root.querySelector(".card")?.classList.contains("enter")).toBe(true);
  });

  it("calls onToggleCollapse when the collapsed pill is clicked", () => {
    const host = document.createElement("div");
    const root = host.attachShadow({ mode: "open" });
    const handlers = makeHandlers();
    renderWidget(root, makeData(), handlers, true);

    (root.querySelector(".pill") as HTMLElement).click();
    expect(handlers.onToggleCollapse).toHaveBeenCalledOnce();
  });
});
