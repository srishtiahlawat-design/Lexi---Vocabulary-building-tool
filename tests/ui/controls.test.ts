import { describe, it, expect, vi } from "vitest";
import { createIndustryField } from "../../src/ui/controls";
import { INDUSTRY_SUGGESTIONS } from "../../src/lib/profile";

const chipLabels = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLButtonElement>(".lx-chip")).map((c) => c.textContent);
const pressed = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLButtonElement>(".lx-chip"))
    .filter((c) => c.getAttribute("aria-pressed") === "true")
    .map((c) => c.textContent);

describe("createIndustryField", () => {
  it("offers more than the first five industries", () => {
    expect(INDUSTRY_SUGGESTIONS).toEqual(expect.arrayContaining(["Education", "Marketing", "Retail"]));
    const field = createIndustryField("", () => {});
    expect(chipLabels(field.el)).toEqual(INDUSTRY_SUGGESTIONS);
    expect(pressed(field.el)).toEqual([]);
  });

  it("selects a listed industry when it is typed or tapped", () => {
    const onChange = vi.fn();
    const field = createIndustryField("law", onChange);
    expect(pressed(field.el)).toEqual(["Law"]);
    (Array.from(field.el.querySelectorAll<HTMLButtonElement>(".lx-chip")).find((c) => c.textContent === "Retail")!).click();
    expect(onChange).toHaveBeenCalledWith("Retail");
    expect(pressed(field.el)).toEqual(["Retail"]);
  });

  it("adds an industry that is not in the list as one more chip at the end, already selected", () => {
    const onChange = vi.fn();
    const field = createIndustryField("", onChange);
    const input = field.el.querySelector("input") as HTMLInputElement;
    input.value = "Aviation";
    input.dispatchEvent(new Event("input"));
    expect(chipLabels(field.el)).toEqual([...INDUSTRY_SUGGESTIONS, "Aviation"]);
    expect(pressed(field.el)).toEqual(["Aviation"]);
    expect(onChange).toHaveBeenLastCalledWith("Aviation");
  });

  it("draws the field and each chip with a hand-drawn outline", () => {
    const field = createIndustryField("", () => {});
    expect(field.el.querySelector(".lx-fieldBox svg path")).not.toBeNull();
    expect(field.el.querySelectorAll(".lx-chip svg path")).toHaveLength(INDUSTRY_SUGGESTIONS.length);
  });
});
