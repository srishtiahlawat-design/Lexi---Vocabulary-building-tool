import { ICON_CLOSE_THIN, ICON_MINIMIZE_THIN, ICON_BOOK, ICON_CHECK_CIRCLE } from "../lib/icons";
import { FONT_DISPLAY, FONT_BODY, loadLexiFonts } from "../ui/fonts";
import { outlineEl } from "../ui/handdrawn";

export interface WidgetData {
  word: string;
  meaning: string;
  example: string;
  pronunciation: string;
  partOfSpeech: string;
  // Up to three similar words; absent or empty when the word has none (the Similar row is then left out).
  synonyms?: string[];
}

// The card is the finalised canvas widget ("Widget - Example laid out like Similar", Klee One + Geist), drawn at canvas
// size (480px wide) and scaled down by U so the ruled lines land on a whole 36px
// pitch. Write every canvas measurement through u() so nothing here is a loose pixel value.
export const U = 36 / 49;
export const u = (designPx: number): string => `${Math.round(designPx * U * 100) / 100}px`;

// Largest first (canvas pixels); the word steps down until it fits the card's text column.
export const WORD_SIZES = [54, 49, 44, 38, 32];

// The expanded card is 320px wide (design.md, "Widget, 320 wide and hugging its content") and its height hugs its
// content. Collapsed, the same shape closes to a pill 48px high whose width follows the word.
export const CARD_WIDTH = 320;
export const PILL_HEIGHT = 48;
// Everything that moves in the minimise / expand morph uses these: the shape glides over 320ms, the card's text fades
// out in 120ms and back in after 140ms, the pill's word fades in after 180ms and out in 100ms.
const EASE = "cubic-bezier(0.22, 0.9, 0.3, 1)";

const CSS = `
  :host { all: initial; }
  .shell {
    --paper: #F7F3EA; --ink: #171717; --ink-2: #45423E; --muted: #66615A; --border: #D8D3C9;
    --rule: rgba(110,155,215,0.3); --margin: rgba(214,100,96,0.42); --btn: #EDE6D4; --line: #77736C; --faint: #8B8579; --off: #FFFDF8;
    --serif: ${FONT_DISPLAY};
    --sans: ${FONT_BODY};
  }
  /* One shape for the card and the pill: collapsing closes it (width, height, corner radius and shadow glide together),
     it never swaps two elements. The card's content stays CARD_WIDTH wide and is clipped from the left. */
  .shell { position: fixed; top: 16px; right: 16px; z-index: 2147483647; box-sizing: border-box; overflow: hidden;
    display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: 1fr; width: ${CARD_WIDTH}px; min-height: ${PILL_HEIGHT}px;
    background: var(--paper); color: var(--ink); border: 1px solid var(--border); border-radius: ${u(13)};
    box-shadow: 0 ${u(12)} ${u(30)} rgba(0,0,0,0.12); font-family: var(--serif);
    transition: width 320ms ${EASE}, grid-template-rows 320ms ${EASE}, border-radius 320ms ${EASE}, box-shadow 320ms ${EASE}; }
  .shell.collapsed { width: var(--pill-w, 128px); grid-template-rows: 0fr; border-radius: ${PILL_HEIGHT / 2}px; box-shadow: 0 8px 20px rgba(0,0,0,0.16); }
  .cell { min-width: 0; min-height: 0; overflow: hidden; }
  .card { position: relative; box-sizing: border-box; width: ${CARD_WIDTH - 2}px; margin-left: auto; display: flex; flex-direction: column;
    transition: opacity 200ms ease 140ms; }
  .shell.collapsed .card { opacity: 0; pointer-events: none; transition: opacity 120ms ease; }
  /* Notebook paper: blue ruled lines (49 canvas px apart = 36px here) starting 8px above the old 32-canvas-px mark
     under the header, and the red margin line at 40 canvas px. */
  .card::before { content: ""; position: absolute; left: 0; right: 0; top: calc(${u(116)} - 8px); bottom: 0; pointer-events: none;
    background: repeating-linear-gradient(to bottom, transparent 0 35px, var(--rule) 35px 36px); }
  .card::after { content: ""; position: absolute; top: 0; bottom: 0; left: ${u(40)}; width: 1px; pointer-events: none; background: var(--margin); }
  .card > * { position: relative; }

  /* Entrance: the card slides in from beyond the right edge the first time it appears (not on expand from the pill). */
  @keyframes lexiSlideIn {
    from { transform: translateX(calc(100% + 32px)); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .shell.enter { animation: lexiSlideIn 450ms ${EASE} backwards; }
  @media (prefers-reduced-motion: reduce) { .shell.enter { animation: none; } .shell, .card, .pill { transition: none !important; } }

  button { font: inherit; color: inherit; background: none; border: none; padding: 0; cursor: pointer; }
  button:focus-visible { outline: 1.5px solid var(--line); outline-offset: 3px; border-radius: 4px; }

  .head { box-sizing: border-box; height: ${u(84)}; display: flex; align-items: center; justify-content: space-between; padding: 0 ${u(26)} 0 ${u(58)};
    border-bottom: 1px solid var(--rule); font-family: var(--sans); }
  .label { margin: 0; font-size: ${u(13)}; text-transform: uppercase; letter-spacing: 0.16em; font-weight: 500; color: var(--faint); }
  .date { margin: ${u(4)} 0 0; font-size: ${u(13)}; font-weight: 400; color: var(--faint); }
  .headBtns { display: flex; align-items: center; gap: ${u(24)}; }
  .minimizeBtn, .closeBtn { display: flex; color: #252525; transition: opacity .15s, transform .15s; }
  .minimizeBtn svg, .closeBtn svg { width: ${u(22)}; height: ${u(22)}; }
  .minimizeBtn:hover, .closeBtn:hover { opacity: 0.6; transform: scale(1.08); }

  .content { padding: ${u(14)} ${u(35)} 0 ${u(58)}; }
  .word { margin: 0; font-size: ${u(54)}; line-height: ${u(62)}; font-weight: 600; letter-spacing: 0; white-space: nowrap; color: var(--ink); }
  .pron { margin: 0; height: ${u(40)}; display: flex; align-items: center; gap: ${u(22)}; font-size: ${u(19)}; letter-spacing: 0.02em; color: var(--ink-2); }
  .pron[hidden] { display: none; }
  /* Klee One has no italic, so the part of speech is set apart by the body font and a lighter colour */
  .pos { font-family: var(--sans); font-size: ${u(17)}; color: var(--muted); }
  .meaning { margin: ${u(23)} 0 0; max-width: ${u(380)}; font-family: var(--sans); font-size: ${u(22)}; line-height: ${u(36)}; font-weight: 400; letter-spacing: 0; color: var(--muted); }
  /* up to three similar words, each in a hand-drawn outline */
  .similar { margin: ${u(16)} 0 0; display: flex; align-items: center; gap: ${u(8)}; flex-wrap: wrap; font-family: var(--sans); }
  .similar[hidden] { display: none; }
  .similarLabel { margin-right: ${u(6)}; font-size: ${u(13)}; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--faint); }
  .chip { position: relative; padding: ${u(5)} ${u(12)}; font-size: ${u(14)}; line-height: ${u(20)}; color: var(--muted); }
  .chip > span { position: relative; }
  /* the Example is one paragraph: its heading starts the line and the sentence wraps beneath it */
  .exampleWrap { margin: ${u(16)} 0 0; max-width: ${u(380)}; font-size: ${u(19)}; line-height: ${u(32)}; font-weight: 400; letter-spacing: 0; color: var(--muted);
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }
  .exampleLabel { margin-right: ${u(12)}; font-family: var(--sans); font-size: ${u(13)}; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: var(--faint); }

  /* the footer sits right under the content (the card hugs it), with a soft fade so the ruled lines ease out behind
     the button. The fade covers the footer only, so it can never reach the last sentence above it. */
  .footer { box-sizing: border-box; padding: ${u(22)} ${u(36)} ${u(30)} ${u(58)};
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
  .footer::before { content: ""; position: absolute; left: 0; right: 0; top: 0; bottom: 0; pointer-events: none;
    background: linear-gradient(to bottom, rgba(247,243,234,0) 0, rgba(247,243,234,0.9) ${u(28)}, rgba(247,243,234,0.9) 100%); }
  .footer > * { position: relative; }
  /* the CTA: off-white, thin border, rounded, a soft shadow underneath */
  .saveBtn { display: inline-flex; align-items: center; gap: ${u(14)}; font-family: var(--sans); font-size: ${u(18)}; font-weight: 400; color: var(--ink-2);
    background: var(--off); border: 1.5px solid var(--border); border-radius: ${u(14)}; padding: ${u(13)} ${u(28)}; white-space: nowrap;
    box-shadow: 0 ${u(8)} ${u(14)} ${u(-8)} rgba(60,50,40,0.30); transition: border-color 160ms ease, color 160ms ease, box-shadow 160ms ease; }
  /* hover: a darker, 0.5px thicker outline (drawn inside, so nothing shifts) and darker text; the fill stays put */
  .saveBtn:hover:not(:disabled) { border-color: #45423E; color: #171717; box-shadow: inset 0 0 0 0.5px #45423E, 0 ${u(8)} ${u(14)} ${u(-8)} rgba(60,50,40,0.30); }
  .saveBtn svg { width: ${u(22)}; height: ${u(22)}; }
  .saveBtn:disabled { cursor: default; opacity: 0.7; }
  .saveBtn.saved { cursor: default; opacity: 1; color: #4F7053; border-color: rgba(79,112,83,0.45); box-shadow: none; }
  .widgetErr { margin: 0; text-align: center; font-family: var(--sans); font-size: 10px; line-height: 14px; color: #a33; }
  .widgetErr:empty { display: none; }

  /* the pill is the collapsed shape: its word fades in once the card has mostly closed, and out again before it opens */
  .pill { position: absolute; left: 0; top: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center;
    border-radius: inherit; color: var(--ink); opacity: 0; pointer-events: none; transition: opacity 100ms ease; }
  .shell.collapsed .pill { opacity: 1; pointer-events: auto; transition: opacity 160ms ease 180ms; }
  .pillWord { font-family: var(--serif); font-size: 19px; font-weight: 600; line-height: 28px; white-space: nowrap; }
`;

function injectStyles(root: ShadowRoot): void {
  const style = document.createElement("style");
  style.textContent = CSS;
  root.appendChild(style);
}

export interface WidgetHandlers {
  onClose: () => void;
  onToggleCollapse: () => void;
  onSave: () => Promise<void>;
}

// Steps the word down until it fits the card's text column. Measurement returns
// 0 when the card isn't laid out yet (e.g. jsdom), in which case the largest
// size is kept.
export function fitWord(card: HTMLElement): void {
  const wordEl = card.querySelector(".word") as HTMLElement | null;
  const wordText = card.querySelector(".wordText") as HTMLElement | null;
  const column = card.querySelector(".content") as HTMLElement | null;
  if (!wordEl || !wordText || !column) return;
  // the text column is the content box minus its left and right padding
  const available = column.clientWidth - (parseFloat(u(58)) + parseFloat(u(35)));
  for (const size of WORD_SIZES) {
    wordEl.style.fontSize = u(size);
    if (!available || wordText.getBoundingClientRect().width <= available) break;
  }
}

// "Mon, 21 Oct" regardless of the browser locale.
function formatDate(d: Date): string {
  const part = (opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-US", opts);
  return `${part({ weekday: "short" })}, ${d.getDate()} ${part({ month: "short" })}`;
}

// The shape is one element in both states; collapsing only toggles a class so the CSS can glide between the two.
// The card's content is inert while collapsed and the pill is out of the tab order while expanded.
function syncCollapsed(shell: HTMLElement, collapsed: boolean): void {
  shell.classList.toggle("collapsed", collapsed);
  shell.querySelector(".card")?.toggleAttribute("inert", collapsed);
  const pill = shell.querySelector<HTMLElement>(".pill");
  if (pill) {
    pill.tabIndex = collapsed ? 0 : -1;
    pill.setAttribute("aria-hidden", String(!collapsed));
  }
}

// Collapse or expand an already-drawn widget (the morph). Does nothing when nothing is drawn yet.
export function setCollapsed(root: ShadowRoot, collapsed: boolean): void {
  const shell = root.querySelector<HTMLElement>(".shell");
  if (shell) syncCollapsed(shell, collapsed);
}

// The pill is as wide as its word plus 24px each side and the 1px border; measured so the CSS can transition to a
// real width. Measurement returns 0 when nothing is laid out yet (e.g. jsdom), in which case the CSS fallback stays.
function measurePill(shell: HTMLElement): void {
  const word = shell.querySelector<HTMLElement>(".pillWord");
  const width = word?.getBoundingClientRect().width ?? 0;
  if (width > 0) shell.style.setProperty("--pill-w", `${Math.ceil(width) + 50}px`);
}

export function renderWidget(
  root: ShadowRoot,
  data: WidgetData,
  handlers: WidgetHandlers,
  collapsed: boolean,
  // animate: slide in (newly appearing). saved: the word is already in the library (saved from this or another
  // tab), so the button starts in its "Added" state.
  opts: { animate?: boolean; saved?: boolean } = {}
): void {
  root.innerHTML = "";
  injectStyles(root);

  const shell = document.createElement("section");
  shell.className = opts.animate && !collapsed ? "shell enter" : "shell";
  shell.setAttribute("aria-label", "Word of the day");
  shell.innerHTML = `<div class="cell"><div class="card">
    <header class="head">
      <div>
        <p class="label">Word of the day</p>
        <p class="date"></p>
      </div>
      <div class="headBtns">
        <button class="minimizeBtn" aria-label="Minimize">${ICON_MINIMIZE_THIN}</button>
        <button class="closeBtn" aria-label="Close">${ICON_CLOSE_THIN}</button>
      </div>
    </header>
    <div class="content">
      <h2 class="word"><span class="wordText"></span></h2>
      <p class="pron"><span class="ipa"></span><span class="pos"></span></p>
      <p class="meaning"></p>
      <div class="similar" hidden><span class="similarLabel">Similar</span></div>
      <p class="exampleWrap"><span class="exampleLabel">Example</span><span class="example"></span></p>
    </div>
    <footer class="footer">
      <button class="saveBtn">${ICON_BOOK}Add to my library</button>
      <p class="widgetErr" role="alert"></p>
    </footer>
  </div></div>
  <button class="pill" aria-label="Open word of the day"><span class="pillWord"></span></button>`;
  const card = shell.querySelector(".card") as HTMLElement;
  shell.querySelector(".pillWord")!.textContent = data.word;
  shell.querySelector(".pill")!.addEventListener("click", handlers.onToggleCollapse);
  card.querySelector(".wordText")!.textContent = data.word;
  (card.querySelector(".pron") as HTMLElement).hidden = !data.pronunciation && !data.partOfSpeech;
  card.querySelector(".ipa")!.textContent = data.pronunciation;
  card.querySelector(".pos")!.textContent = data.partOfSpeech;
  card.querySelector(".meaning")!.textContent = data.meaning;
  card.querySelector(".example")!.textContent = data.example;
  const synonyms = data.synonyms ?? [];
  if (synonyms.length) {
    const similar = card.querySelector(".similar") as HTMLElement;
    similar.hidden = false;
    synonyms.forEach((word, i) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      const label = document.createElement("span");
      label.textContent = word;
      chip.append(outlineEl("chip", { variant: i }), label);
      similar.appendChild(chip);
    });
  }
  card.querySelector(".date")!.textContent = formatDate(new Date());
  card.querySelector(".minimizeBtn")!.addEventListener("click", handlers.onToggleCollapse);
  card.querySelector(".closeBtn")!.addEventListener("click", handlers.onClose);

  const saveBtn = card.querySelector(".saveBtn") as HTMLButtonElement;
  const widgetErr = card.querySelector(".widgetErr") as HTMLElement;
  if (opts.saved) {
    saveBtn.disabled = true;
    saveBtn.classList.add("saved");
    saveBtn.innerHTML = `${ICON_CHECK_CIRCLE}Added to my library`;
  }
  saveBtn.addEventListener("click", async () => {
    widgetErr.textContent = "";
    saveBtn.disabled = true;
    saveBtn.innerHTML = "Saving…";
    try {
      await handlers.onSave();
      saveBtn.classList.add("saved");
      saveBtn.innerHTML = `${ICON_CHECK_CIRCLE}Added to my library`;
    } catch (e) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `${ICON_BOOK}Add to my library`;
      widgetErr.textContent = e instanceof Error ? e.message : "Couldn't save that word.";
    }
  });

  syncCollapsed(shell, collapsed);
  root.appendChild(shell);
  fitWord(card);
  measurePill(shell);
  // The bundled fonts arrive a moment after first paint and change text widths, so measure again once they land.
  const remeasure = () => {
    if (!shell.isConnected) return;
    fitWord(card);
    measurePill(shell);
  };
  void loadLexiFonts().then(remeasure);
  document.fonts?.ready.then(remeasure);
}

export interface WidgetView {
  data: WidgetData;
  collapsed: boolean;
  saved: boolean;
}

export interface WidgetHost {
  // Show (or update) the widget in this tab, or remove it with null. Safe to call repeatedly with the same view.
  update(view: WidgetView | null, opts?: { animate?: boolean }): void;
}

// Thin DOM wiring, like the old mountWidget: one fixed host element per tab holding the shadow root. It no longer
// owns any state (collapsed / closed) - that lives in shared storage (see lib/widgetState.ts) so every tab agrees -
// it just draws whatever view it is handed, and only redraws when that view actually changed.
export function createWidgetHost(handlers: WidgetHandlers): WidgetHost {
  let host: HTMLDivElement | null = null;
  let shadow: ShadowRoot | null = null;
  let lastKey = "";
  let lastView: WidgetView | null = null;

  return {
    update(view, opts = {}) {
      if (!view) {
        host?.remove();
        host = null;
        shadow = null;
        lastKey = "";
        lastView = null;
        return;
      }
      const created = !host || !host.isConnected;
      if (created) {
        document.querySelectorAll("#lexi-widget-host").forEach((el) => el.remove()); // never two widgets in a tab
        host = document.createElement("div");
        host.id = "lexi-widget-host";
        shadow = host.attachShadow({ mode: "open" });
        document.body.appendChild(host);
        lastKey = "";
        lastView = null;
      }
      const key = JSON.stringify(view);
      if (key === lastKey) return;
      // Only minimise / expand changed: morph the drawn widget instead of redrawing it.
      const onlyCollapsedChanged =
        !created && lastView !== null && lastView.saved === view.saved && lastView.collapsed !== view.collapsed &&
        JSON.stringify(lastView.data) === JSON.stringify(view.data);
      // A tab in the background doesn't run the morph until it is next shown, so it would play late, when you switch
      // to it. Redraw those tabs straight into the final state instead, so they simply look finished.
      if (onlyCollapsedChanged && document.visibilityState !== "hidden") {
        setCollapsed(shadow!, view.collapsed);
      } else {
        // slide in only when it newly appears live
        renderWidget(shadow!, view.data, handlers, view.collapsed, {
          animate: created && Boolean(opts.animate) && !view.collapsed,
          saved: view.saved,
        });
      }
      lastKey = key;
      lastView = view;
    },
  };
}
