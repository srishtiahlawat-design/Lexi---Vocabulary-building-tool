import { describe, it, expect, vi, afterEach } from "vitest";
import { easeInOutCubic, playStickOn, STICK, STICK_TOTAL_MS, stickFrames, stickShadeFrames, stickShadowFrames } from "../../src/ui/stickOn";

afterEach(() => {
  document.body.innerHTML = "";
  vi.unstubAllGlobals();
  delete (Element.prototype as unknown as { animate?: unknown }).animate;
});

const num = (frame: Keyframe, re: RegExp): number => Number(String(frame.transform).match(re)![1]);

describe("stick-on keyframes", () => {
  it("starts edge-on at the top right and ends flat and fully visible", () => {
    const frames = stickFrames();
    expect(frames[0].offset).toBe(0);
    expect(frames[0].opacity).toBe(0);
    expect(num(frames[0], /rotateY\(([-\d.]+)deg\)/)).toBe(84);
    expect(frames[0].transform).toContain("translate(70.0px, -90.0px)");
    const last = frames[frames.length - 1];
    expect(last.offset).toBe(1);
    expect(last.opacity).toBe(1);
    expect(num(last, /rotateY\(([-\d.]+)deg\)/)).toBe(0);
    expect(num(last, /scale\(([-\d.]+)\)/)).toBe(1);
  });

  it("lowers in one smooth curve with no bounce: the hinge angle never rises or goes past flat", () => {
    const angles = stickFrames().map((f) => num(f, /rotateY\(([-\d.]+)deg\)/));
    for (let i = 1; i < angles.length; i++) expect(angles[i]).toBeLessThanOrEqual(angles[i - 1]);
    expect(Math.min(...angles)).toBe(0);
  });

  it("eases in and out (slow at both ends) and tightens the shadow and clears the shade as it lands", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.1)).toBeLessThan(0.1);
    expect(easeInOutCubic(0.9)).toBeGreaterThan(0.9);
    const shadow = stickShadowFrames();
    expect(String(shadow[0].boxShadow)).toContain("-16.0px 22.0px 30.0px -10.0px");
    expect(String(shadow[shadow.length - 1].boxShadow)).toContain("0.0px 12.0px 16.0px -9.0px rgba(40, 70, 50, 0.340)");
    const shade = stickShadeFrames();
    expect(shade[0].opacity).toBeCloseTo(0.95);
    expect(shade[shade.length - 1].opacity).toBe(0);
  });

  it("fits the documented timings", () => {
    expect(STICK.landMs).toBe(1000);
    expect(STICK.yellowFadeDelay).toBe(740);
    expect(STICK.yellowFadeMs).toBe(400);
    expect(STICK_TOTAL_MS).toBe(1520);
  });
});

function setup() {
  const oldBanner = document.createElement("div");
  oldBanner.innerHTML = `<div class="noteCard"></div><div class="noteCaption"></div>`;
  const banner = document.createElement("div");
  banner.innerHTML = `<div class="addedSpin"><div class="addedCard"><div class="addedShade"></div><svg><circle/><path/></svg></div></div>`;
  const row = document.createElement("div");
  document.body.append(banner, row);
  const card = banner.querySelector(".addedCard") as HTMLElement;
  Object.defineProperty(card, "offsetHeight", { value: 76 });
  Object.defineProperty(row, "offsetHeight", { value: 58 });
  return { oldBanner, banner, row };
}

describe("playStickOn", () => {
  it("does nothing where the Web Animations API is missing", () => {
    const { oldBanner, banner } = setup();
    expect(playStickOn({ banner, oldBanner, fromHeight: 366, rule: 61 })).toBe(false);
    expect(banner.querySelector(".noteCard")).toBeNull(); // untouched
  });

  it("does nothing for people who prefer reduced motion", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const { oldBanner, banner } = setup();
    (Element.prototype as unknown as { animate: unknown }).animate = vi.fn();
    expect(playStickOn({ banner, oldBanner, fromHeight: 366, rule: 61 })).toBe(false);
  });

  it("keeps the old note under the sticker, closes the area to whole ruled rows, then cleans up", async () => {
    const { oldBanner, banner, row } = setup();
    const animate = vi.fn().mockReturnValue({ finished: Promise.resolve(), cancel: vi.fn() });
    (Element.prototype as unknown as { animate: unknown }).animate = animate;

    expect(playStickOn({ banner, oldBanner, fromHeight: 366, rule: 61, row })).toBe(true);
    const spin = banner.querySelector(".addedSpin") as HTMLElement;
    expect(spin.classList.contains("sticking")).toBe(true);
    expect(banner.firstElementChild?.className).toBe("noteCard"); // the yellow note sits under the sticker
    expect(banner.style.minHeight).toBe("0px");
    expect(animate).toHaveBeenCalled();
    // one of the animations closes the banner from its old height to 76 + 16 snapped up to two 61px rows
    const heights = animate.mock.calls.map(([frames]) => frames).filter((f: Keyframe[]) => f[0].height !== undefined && f[0].height !== "0px");
    expect(heights.some((f: Keyframe[]) => f[0].height === "366px" && f[1].height === "122px")).toBe(true);

    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(spin.classList.contains("sticking")).toBe(false);
    expect(banner.querySelector(".noteCard")).toBeNull();
    expect(banner.querySelector(".noteCaption")).toBeNull();
    expect(banner.style.minHeight).toBe("122px");
  });
});
