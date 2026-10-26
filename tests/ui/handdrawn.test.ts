import { describe, it, expect } from "vitest";
import { outlineEl, outlinePath, outlineSvg, OUTLINE, OUTLINE_STRONG } from "../../src/ui/handdrawn";

describe("hand-drawn outlines", () => {
  it("builds a stretchable svg with a constant stroke and the warm-grey line by default", () => {
    const html = outlineSvg("chip");
    expect(html).toContain('preserveAspectRatio="none"');
    expect(html).toContain("vector-effect=\"non-scaling-stroke\"");
    expect(html).toContain(`stroke="${OUTLINE}"`);
    expect(html).toContain("pointer-events:none");
  });

  it("takes a stroke colour, width and viewBox per kind", () => {
    const html = outlineSvg("bar", { stroke: OUTLINE_STRONG, width: 1.5 });
    expect(html).toContain(`stroke="${OUTLINE_STRONG}"`);
    expect(html).toContain('stroke-width="1.5"');
    expect(html).toContain('viewBox="0 0 313 42"');
  });

  it("varies the chip path by variant and wraps around", () => {
    expect(outlinePath("chip", 0)).not.toBe(outlinePath("chip", 1));
    expect(outlinePath("chip", 3)).toBe(outlinePath("chip", 0));
    expect(outlinePath("bar", 5)).toBe(outlinePath("bar", 0));
  });

  it("makes a real svg element too", () => {
    const el = outlineEl("check", { variant: 1 });
    expect(el.tagName.toLowerCase()).toBe("svg");
    expect(el.querySelector("path")!.getAttribute("d")).toBe(outlinePath("check", 1));
  });
});
