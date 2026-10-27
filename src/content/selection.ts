import { ICON_CLOSE_THIN, ICON_BOOK, ICON_CHECK_CIRCLE } from "../lib/icons";
import { requestAddWord, requestLookup } from "../lib/messages";
import { logoMarkSvg } from "../lib/logo";
import { isLookupCandidate } from "./selectionRules";
import { FONT_DISPLAY, FONT_BODY, loadLexiFonts } from "../ui/fonts";

// The popover is as wide as its word and meaning need, between these two (the finalised canvas boards).
const POPOVER_MIN_WIDTH = 190;
const POPOVER_MAX_WIDTH = 280;
const GAP = 12;
// Wait for the selection to settle before asking the model what it means, so dragging across text or
// re-selecting quickly doesn't fire a call for every stop along the way.
const LOOKUP_DELAY_MS = 350;
let host: HTMLDivElement | null = null;
let lookupTimer: ReturnType<typeof setTimeout> | null = null;
// Bumped whenever the popover is replaced or closed, so a lookup that resolves late can tell it is stale.
let popoverId = 0;

function removePopover(): void {
  popoverId++;
  if (lookupTimer) clearTimeout(lookupTimer);
  lookupTimer = null;
  host?.remove();
  host = null;
}

function isEditable(node: Node | null): boolean {
  let el = node instanceof Element ? node : node?.parentElement ?? null;
  while (el) {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable) return true;
    el = el.parentElement;
  }
  return false;
}

function injectStyles(root: ShadowRoot): void {
  const style = document.createElement("style");
  style.textContent = `
    .popover { position: fixed; width: max-content; min-width: ${POPOVER_MIN_WIDTH}px; max-width: ${POPOVER_MAX_WIDTH}px; box-sizing: border-box; z-index: 2147483647;
      --paper: #F7F3EA; --border: #D8D3C9; --rule: rgba(110,155,215,0.3); --margin: rgba(214,100,96,0.42); --off: #FFFDF8;
      background: var(--paper); color: #171717; border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 10px 24px rgba(0,0,0,0.18);
      font-family: ${FONT_BODY}; }
    /* the card keeps the notebook look in small: a red margin line 16px from the left edge, a blue rule under the header;
       everything inside starts 34px from the edge */
    .popover::before { content: ""; position: absolute; top: 0; bottom: 0; left: 16px; width: 1px; background: var(--margin); z-index: 2; pointer-events: none; }
    /* default: popover sits to the RIGHT of the selection, caret on the left edge pointing left at it */
    .caret { position: absolute; left: -6px; top: 50%; width: 10px; height: 10px; background: var(--paper);
      border-left: 1px solid var(--border); border-bottom: 1px solid var(--border); transform: translateY(-50%) rotate(45deg); }
    /* when there's no room on the right, popover sits to the LEFT of the selection instead */
    .popover.placeLeft .caret { left: auto; right: -6px; border-left: none; border-bottom: none;
      border-right: 1px solid var(--border); border-top: 1px solid var(--border); }
    .row { height: 35px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; padding: 0 10px 0 34px; border-bottom: 1px solid var(--rule); }
    /* eased in rather than snapping on: a short fade and rise (same easing as the rest of the extension) */
    @keyframes lexiPopoverIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
    @media (prefers-reduced-motion: no-preference) { .popover { animation: lexiPopoverIn 160ms cubic-bezier(0.22, 0.9, 0.3, 1); } }
    .action { transition: border-color 160ms ease, color 160ms ease, box-shadow 160ms ease; }
    .brand { display: flex; align-items: center; gap: 7px; }
    .brand svg { display: block; }
    .closeBtn { color: #252525; cursor: pointer; background: none; border: none; padding: 0; display: flex; }
    .closeBtn svg { width: 12px; height: 12px; }
    /* the word in the display font with its part of speech right beside it, baseline-aligned */
    .word { min-height: 35px; box-sizing: border-box; display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 8px; padding: 6px 12px 6px 34px;
      font-family: ${FONT_DISPLAY}; font-size: 18px; line-height: 22px; font-weight: 600; }
    .wordText { word-break: break-word; }
    .pos { font-family: ${FONT_BODY}; font-size: 11px; line-height: 14px; font-weight: 400; color: #66615A; }
    /* meaning: up to 4 lines, with the last 2 fading out when it runs longer so the button below sits cleanly */
    .meaning { margin: 0 12px 0 34px; font-size: 13px; line-height: 18px; color: #45423E; max-height: 72px; overflow: hidden; position: relative; }
    .meaning:empty { display: none; }
    .meaning.clipped { -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 36px, transparent 72px); mask-image: linear-gradient(to bottom, #000 0, #000 36px, transparent 72px); }
    .meaning.muted { color: #8A857B; }
    .skeleton { display: flex; flex-direction: column; gap: 6px; margin: 2px 12px 0 34px; }
    .skeleton i { display: block; height: 8px; border-radius: 4px; background: #E6DFCF; }
    .skeleton i:last-child { width: 60%; }
    @media (prefers-reduced-motion: no-preference) { .skeleton i { animation: lexiPulse 1.2s ease-in-out infinite; } }
    @keyframes lexiPulse { 50% { opacity: 0.45; } }
    /* the CTA: off-white, thin border, rounded, a soft shadow underneath; 205px wide */
    .action { display: flex; align-items: center; justify-content: center; gap: 8px; box-sizing: border-box; width: 205px; height: 36px;
      margin: 12px 17px 14px 34px; font-size: 12px; font-weight: 400; color: #45423E; background: var(--off);
      border: 1.5px solid var(--border); border-radius: 10px; box-shadow: 0 6px 10px -6px rgba(60,50,40,0.30);
      cursor: pointer; font-family: inherit; white-space: nowrap; }
    /* hover: darker, 0.5px thicker outline (drawn inside, nothing shifts) and darker text; the fill stays */
    .action:hover:not(:disabled) { border-color: #45423E; color: #171717; box-shadow: inset 0 0 0 0.5px #45423E, 0 6px 10px -6px rgba(60,50,40,0.30); }
    .action svg { width: 14px; height: 14px; }
    .action.saved { color: #4F7053; border-color: rgba(79,112,83,0.45); box-shadow: none; cursor: default; }
    .action:disabled { cursor: default; opacity: 0.75; }
    .action.saved:disabled { opacity: 1; }
    .err { color: #A33333; font-size: 10px; padding: 0 12px 10px 34px; }
    .err:empty { display: none; }
  `;
  root.appendChild(style);
}

function showPopover(selectedText: string, rect: DOMRect): void {
  removePopover();

  host = document.createElement("div");
  host.id = "lexi-selection-host";
  const shadow = host.attachShadow({ mode: "open" });
  document.body.appendChild(host);
  injectStyles(shadow);

  const popover = document.createElement("div");
  popover.className = "popover";

  popover.innerHTML = `
    <div class="caret"></div>
    <div class="row">
      <span class="brand">${logoMarkSvg(18)}</span>
      <button class="closeBtn" aria-label="Close">${ICON_CLOSE_THIN}</button>
    </div>
    <div class="word"><span class="wordText"></span></div>
    <div class="skeleton" aria-label="Loading meaning"><i></i><i></i><i></i></div>
    <div class="meaning" aria-live="polite"></div>
    <button class="action">${ICON_BOOK}Add to my library</button>
    <div class="err"></div>
  `;
  popover.querySelector(".wordText")!.textContent = selectedText;
  popover.querySelector(".closeBtn")!.addEventListener("click", removePopover);

  const myId = popoverId;
  const skeletonEl = popover.querySelector(".skeleton") as HTMLDivElement;
  const meaningEl = popover.querySelector(".meaning") as HTMLDivElement;
  const actionBtn = popover.querySelector(".action") as HTMLButtonElement;
  const errEl = popover.querySelector(".err") as HTMLDivElement;
  actionBtn.addEventListener("click", async () => {
    errEl.textContent = "";
    actionBtn.disabled = true;
    actionBtn.innerHTML = "Saving…";
    try {
      const response = await requestAddWord(selectedText);
      if (!response?.ok) throw new Error(response?.error ?? "Couldn't save that word.");
      actionBtn.classList.add("saved");
      actionBtn.innerHTML = `${ICON_CHECK_CIRCLE}Added to my library`;
    } catch (e) {
      console.error("Lexi: failed to save word from selection", e);
      actionBtn.disabled = false;
      actionBtn.innerHTML = `${ICON_BOOK}Add to my library`;
      errEl.textContent = e instanceof Error ? e.message : "Couldn't save that word.";
    }
  });

  shadow.appendChild(popover);

  // Sits beside the selection - on the right if it fits, else on the left - and stays on screen. Run again whenever
  // the size changes (the part of speech, the meaning and the fonts all arrive after the first paint).
  const place = () => {
    const width = popover.offsetWidth;
    const fitsOnRight = rect.right + GAP + width <= window.innerWidth - 8;
    popover.classList.toggle("placeLeft", !fitsOnRight);
    popover.style.left = `${fitsOnRight ? rect.right + GAP : Math.max(8, rect.left - GAP - width)}px`;
    const maxTop = window.innerHeight - popover.offsetHeight - 8;
    const centred = rect.top + rect.height / 2 - popover.offsetHeight / 2;
    popover.style.top = `${Math.max(8, Math.min(centred, maxTop))}px`;
  };
  place();
  void loadLexiFonts().then(() => myId === popoverId && place());

  lookupTimer = setTimeout(async () => {
    lookupTimer = null;
    let response;
    try {
      response = await requestLookup(selectedText);
    } catch (e) {
      response = { ok: false as const, error: e instanceof Error ? e.message : "Couldn't load the meaning." };
    }
    if (myId !== popoverId) return; // closed or replaced while waiting
    skeletonEl.remove();
    meaningEl.replaceChildren();
    if (response?.ok) {
      if (response.partOfSpeech) {
        const pos = document.createElement("span");
        pos.className = "pos";
        pos.textContent = response.partOfSpeech;
        popover.querySelector(".word")!.appendChild(pos);
      }
      meaningEl.textContent = response.meaning;
      if (response.saved) {
        actionBtn.classList.add("saved");
        actionBtn.disabled = true;
        actionBtn.innerHTML = `${ICON_CHECK_CIRCLE}In your library`;
      }
    } else {
      meaningEl.classList.add("muted");
      meaningEl.textContent = response?.error ?? "Couldn't load the meaning.";
    }
    meaningEl.classList.toggle("clipped", meaningEl.scrollHeight > meaningEl.clientHeight + 1);
    place();
  }, LOOKUP_DELAY_MS);
}

document.addEventListener("mouseup", (event) => {
  if (host && event.composedPath().includes(host)) return;

  const selection = window.getSelection();
  const text = selection?.toString().trim() ?? "";
  if (!isLookupCandidate(text)) {
    removePopover();
    return;
  }
  if (!selection || selection.rangeCount === 0 || isEditable(selection.anchorNode)) return;

  const rect = selection.getRangeAt(0).getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;

  showPopover(text, rect);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") removePopover();
});

window.addEventListener("scroll", removePopover, true);
