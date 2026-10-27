import { MOTION, reducedMotion } from "./motion";

// The today's-word banner turning into the "Added to your library" note (design.md, "Banner to Added animation"):
// the green note is stuck on top of the yellow one like a sticker, hinged at its right edge, then the yellow note
// fades away, the green check draws itself, the space closes up and the new word slides into the list. Everything
// here is skipped for people who prefer reduced motion (playStickOn returns false and the caller just swaps).

export const STICK = {
  landMs: 1000, // the sticker lowers in one smooth curve, no overshoot
  yellowFadeDelay: 740,
  yellowFadeMs: 400,
  captionFadeMs: 260,
  ringDelay: 760,
  ringMs: 300,
  tickDelay: 980,
  tickMs: 260,
  listDelay: 1200, // the banner area closes and the new row slides in
  listMs: 320,
  rowOpacityDelay: 1240,
  rowOpacityMs: 240,
} as const;

// When the sequence is over; the confirmation's own hold starts from here.
export const STICK_TOTAL_MS = STICK.listDelay + STICK.listMs;

const SAMPLES = 14;

// Ease in and out (cubic): the sticker leaves slowly, lands slowly, and never bounces past flat.
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// The spin: the sticker starts at the top right, edge-on and tilted, and lowers about its right edge. Sampled from one
// easing curve, so the right edge touches first, then the middle, then the left. Ends flat (the card's own -0.8 degree
// resting tilt lives on the card inside, not here).
export function stickFrames(): Keyframe[] {
  const frames: Keyframe[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1);
    const left = 1 - easeInOutCubic(t); // 1 at the start, 0 when it has landed
    frames.push({
      offset: t,
      opacity: Math.min(1, t * 6),
      transform:
        `perspective(900px) translate(${(70 * left).toFixed(1)}px, ${(-90 * left).toFixed(1)}px) ` +
        `rotateY(${(84 * left).toFixed(1)}deg) rotateX(${(20 * left).toFixed(1)}deg) ` +
        `rotateZ(${(-13.2 * left).toFixed(2)}deg) scale(${(0.88 + 0.12 * (1 - left)).toFixed(3)})`,
    });
  }
  return frames;
}

// The shadow tightens from a big soft one (lifted) to the resting note shadow as it lands.
export function stickShadowFrames(): Keyframe[] {
  const frames: Keyframe[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1);
    const left = 1 - easeInOutCubic(t);
    frames.push({
      offset: t,
      boxShadow:
        `0 1px 1px rgba(40, 70, 50, 0.10), ${(-16 * left).toFixed(1)}px ${(12 + 10 * left).toFixed(1)}px ` +
        `${(16 + 14 * left).toFixed(1)}px ${(-9 - left).toFixed(1)}px rgba(40, 70, 50, ${(0.34 - 0.04 * left).toFixed(3)})`,
    });
  }
  return frames;
}

// A faint shade over the lifted (left) side that clears as the sticker presses down.
export function stickShadeFrames(): Keyframe[] {
  const frames: Keyframe[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const t = i / (SAMPLES - 1);
    frames.push({ offset: t, opacity: Number((0.95 * (1 - easeInOutCubic(t))).toFixed(3)) });
  }
  return frames;
}

export interface StickOnOptions {
  // The new banner (holding the confirmation) and the old one it replaces, already out of the page: its note and
  // caption are kept in place under the sticker while the sticker lands.
  banner: HTMLElement;
  oldBanner: HTMLElement;
  // The old banner's height, and the ruled-row pitch the final height snaps to.
  fromHeight: number;
  rule: number;
  // The new word's row in the list, which slides in once the space closes. Optional.
  row?: HTMLElement | null;
}

// Plays the sequence. Returns false (and touches nothing) when it can't or shouldn't animate, so the caller does its
// ordinary swap. Otherwise returns true; the banner ends exactly where a plain render would leave it.
export function playStickOn(o: StickOnOptions): boolean {
  const { banner, oldBanner } = o;
  if (reducedMotion() || typeof banner.animate !== "function") return false;
  const spin = banner.querySelector<HTMLElement>(".addedSpin");
  const card = banner.querySelector<HTMLElement>(".addedCard");
  const note = oldBanner.querySelector<HTMLElement>(".noteCard");
  const caption = oldBanner.querySelector<HTMLElement>(".noteCaption");
  if (!spin || !card || !note) return false;

  banner.insertBefore(note, spin);
  if (caption) banner.insertBefore(caption, spin);
  spin.classList.add("sticking");
  const toHeight = Math.ceil((card.offsetHeight + 16) / o.rule) * o.rule;

  const animations: Animation[] = [];
  const run = (el: Element, frames: Keyframe[], options: KeyframeAnimationOptions): void => {
    animations.push(el.animate(frames, { fill: "both", ...options }));
  };
  run(spin, stickFrames(), { duration: STICK.landMs, easing: "linear" });
  run(card, stickShadowFrames(), { duration: STICK.landMs, easing: "linear" });
  const shade = card.querySelector(".addedShade");
  if (shade) run(shade, stickShadeFrames(), { duration: STICK.landMs, easing: "linear" });
  run(note, [{ opacity: 1 }, { opacity: 0 }], { duration: STICK.yellowFadeMs, delay: STICK.yellowFadeDelay, easing: "ease" });
  if (caption) run(caption, [{ opacity: 1 }, { opacity: 0 }], { duration: STICK.captionFadeMs, easing: "ease" });

  // the check draws itself: the ring, then the tick
  const strokes: Array<[Element | null, number, number]> = [
    [card.querySelector("circle"), STICK.ringDelay, STICK.ringMs],
    [card.querySelector("path"), STICK.tickDelay, STICK.tickMs],
  ];
  const drawn: SVGElement[] = [];
  for (const [el, delay, duration] of strokes) {
    if (!el) continue;
    el.setAttribute("pathLength", "1");
    (el as SVGElement).style.strokeDasharray = "1";
    drawn.push(el as SVGElement);
    run(el, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration, delay, easing: "ease" });
  }

  banner.style.minHeight = "0px";
  run(banner, [{ height: `${o.fromHeight}px` }, { height: `${toHeight}px` }], {
    duration: STICK.listMs,
    delay: STICK.listDelay,
    easing: MOTION.ease,
  });
  const row = o.row ?? null;
  const rowOverflow = row?.style.overflow ?? "";
  if (row) {
    const rowHeight = row.offsetHeight;
    row.style.overflow = "hidden";
    run(row, [{ height: "0px" }, { height: `${rowHeight}px` }], { duration: STICK.listMs, delay: STICK.listDelay, easing: MOTION.ease });
    run(row, [{ opacity: 0 }, { opacity: 1 }], { duration: STICK.rowOpacityMs, delay: STICK.rowOpacityDelay, easing: "ease" });
  }

  void Promise.all(animations.map((a) => a.finished.then(() => undefined, () => undefined))).then(() => {
    animations.forEach((a) => a.cancel());
    note.remove();
    caption?.remove();
    spin.classList.remove("sticking");
    drawn.forEach((el) => (el.style.strokeDasharray = ""));
    if (row) row.style.overflow = rowOverflow;
    banner.style.minHeight = `${toHeight}px`;
  });
  return true;
}
