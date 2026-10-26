// The hand-drawn outlines of the final designs (see design.md, "Inputs", "Chips" and "Side-panel CTAs"). An outline is an
// SVG path stretched over its element (preserveAspectRatio none) with a constant stroke width, so one wobbly path fits a
// chip, a search bar or a box of any size. The element it goes in must be position: relative; the svg ignores pointer
// events. Inline SVG, so it renders under any page CSP (content scripts) as well as in the side panel.

export const OUTLINE = "#B3AC9E"; // the usual warm-grey line
export const OUTLINE_LIGHT = "#CFC9BC"; // the Add a word input
export const OUTLINE_STRONG = "#45423E"; // selected chips, checked boxes, selected radios

export type OutlineKind = "chip" | "bar" | "box" | "check" | "radio";

const VIEWBOX: Record<OutlineKind, string> = {
  chip: "0 0 100 30",
  bar: "0 0 313 42",
  box: "0 0 273 66",
  check: "0 0 100 100",
  radio: "0 0 20 20",
};

// A few slightly different paths per kind so a row of chips or boxes does not look stamped.
const PATHS: Record<OutlineKind, string[]> = {
  chip: [
    "M7 1.8 C28 1 66 2.4 92 1.6 C97 1.8 99 4.6 98.6 9 C99.2 14 98.2 20 98.7 23.4 C98.4 27 96 28.4 91 28.1 C66 29.2 30 27.6 9 28.4 C3.6 28.2 1.4 25.6 1.7 21 C1 16 2 10.6 1.5 7 C1.7 3.6 3.8 1.9 8 1.6 L14 1.7",
    "M8 1.4 C30 2.4 64 1 90 2 C96 2.4 98.8 5.4 98.2 10 C97.8 15 99 20 98.4 23.6 C98.8 27 95.6 28.6 90 28.3 C64 27.4 34 29 10 27.8 C4 27.4 1.2 24.4 1.9 20 C2.4 15 1 10 1.8 6.6 C2.2 3.2 5 1.6 9.5 1.4 L16 1.2",
    "M6.5 2 C26 1.2 68 2.6 93 1.4 C97.4 1.6 99.2 5 98.8 9.4 C98 14.4 99.2 19 98.5 23 C98.9 26.6 96.4 28.7 92 28.2 C68 28.9 28 27.4 8.6 28.6 C3.2 28.1 1.6 25 1.4 21.4 C2.2 16 1.2 11 1.9 7.4 C1.6 4 3.6 2.2 7.4 1.9 L13 2.1",
  ],
  bar: [
    "M12 1.8 C80 1 220 2.4 300 1.6 C307 1.8 311.4 5 311 11 C311.8 18 310.6 26 311.2 31 C310.8 37 307 40.4 300 40 C220 41.2 85 39.6 12 40.4 C5 40.2 1.6 36.6 2 30 C1.2 23 2.4 16 1.8 10 C2 4.8 5.4 2 12 1.6 L24 1.8",
  ],
  box: [
    "M9 2.2 C60 1.2 150 3 262 1.8 C268 2 271 5 270.6 11 C271.4 24 270 44 270.8 56 C270.4 62 267 63.4 261 63 C150 64.4 60 62 12 63.2 C5.6 63.6 2.4 60 2.8 54 C1.8 40 3 22 2.6 10 C2.4 5 5.4 2.4 11 2 L22 2.3",
  ],
  check: [
    "M14 3 C38 1.5 66 3.5 88 2 C95 2.5 98 6 97.5 13 C98.5 36 96.5 62 97.8 87 C97 94 93 97.5 86 97 C62 98.5 36 96.5 12 98 C5 97.5 2 93 2.5 86 C1.5 62 3.5 36 2 12 C2.5 6 6 3 13 3 L24 3.4",
    "M12 2.5 C36 3.5 62 1.5 87 3 C94 3 98 7 97.6 14 C96.8 38 98.5 64 97 86 C97.5 93 93 98 85 97.5 C60 96.5 34 98.5 13 97 C6 97 2 93 2.4 85 C3.5 62 1.5 38 2.6 13 C2 6.5 6 2.8 12 2.6 L22 2.8",
  ],
  radio: ["M10 1.5 C14.8 1.2 18.6 5 18.4 10 C18.6 14.9 14.7 18.7 9.9 18.4 C5 18.7 1.3 14.8 1.6 9.9 C1.3 5.1 5.2 1.4 10.2 1.6"],
};

export interface OutlineOptions {
  stroke?: string;
  width?: number;
  // Picks one of the kind's paths (wraps around), so neighbours differ.
  variant?: number;
}

export function outlinePath(kind: OutlineKind, variant = 0): string {
  const paths = PATHS[kind];
  return paths[Math.abs(variant) % paths.length];
}

// The svg as an HTML string, to drop in as the first child of a position: relative element.
export function outlineSvg(kind: OutlineKind, opts: OutlineOptions = {}): string {
  const stroke = opts.stroke ?? OUTLINE;
  const width = opts.width ?? 1.3;
  return (
    `<svg aria-hidden="true" viewBox="${VIEWBOX[kind]}" preserveAspectRatio="none" ` +
    `style="position:absolute;top:0;left:0;width:100%;height:100%;overflow:visible;pointer-events:none">` +
    `<path d="${outlinePath(kind, opts.variant)}" fill="none" stroke="${stroke}" stroke-width="${width}" ` +
    `stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`
  );
}

// The same, for code that builds DOM nodes instead of HTML.
export function outlineEl(kind: OutlineKind, opts: OutlineOptions = {}): SVGSVGElement {
  const tpl = document.createElement("template");
  tpl.innerHTML = outlineSvg(kind, opts);
  return tpl.content.firstElementChild as SVGSVGElement;
}

// The hand-drawn magnifier of the search bar (a wobbly circle and handle), 17px.
export const ICON_SEARCH_HAND = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.2 4.1 C14.9 3.7 18.3 6.8 18 11 C17.8 14.9 14.7 18.2 10.9 17.9 C7 18.2 3.8 14.8 4.1 10.9 C3.8 7.1 7 4.2 11.4 4 L12.8 4.3"/><path d="M16 16.2 C17.6 17.8 19.3 19.4 21.2 21.1"/></svg>`;

// The pencil of the Add a word input.
export const ICON_PENCIL = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
