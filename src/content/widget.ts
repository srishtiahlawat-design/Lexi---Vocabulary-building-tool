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

const CSS = `
  :host { all: initial; }
  .card, .pill {
    --paper: #F7F3EA; --ink: #171717; --ink-2: #45423E; --muted: #66615A; --border: #D8D3C9;
    --rule: rgba(110,155,215,0.3); --margin: rgba(214,100,96,0.42); --btn: #EDE6D4; --line: #77736C; --faint: #8B8579; --off: #FFFDF8;
    --serif: ${FONT_DISPLAY};
    --sans: ${FONT_BODY};
  }
  .card { position: fixed; top: 16px; right: 16px; z-index: 2147483647; box-sizing: border-box;
    width: ${u(480)}; min-height: ${u(579)}; display: flex; flex-direction: column;
    background: var(--paper); color: var(--ink); border: 1px solid var(--border); border-radius: ${u(13)};
    box-shadow: 0 ${u(12)} ${u(30)} rgba(0,0,0,0.12); overflow: hidden; font-family: var(--serif); }
  /* Notebook paper: blue ruled lines (49 canvas px apart = 36px here) starting 32 canvas px under the header, and the
     red margin line at 40 canvas px. */
  .card::before { content: ""; position: absolute; left: 0; right: 0; top: ${u(116)}; bottom: 0; pointer-events: none;
    background: repeating-linear-gradient(to bottom, transparent 0 35px, var(--rule) 35px 36px); }
  .card::after { content: ""; position: absolute; top: 0; bottom: 0; left: ${u(40)}; width: 1px; pointer-events: none; background: var(--margin); }
  .card > * { position: relative; }

  /* Entrance: the card slides in from beyond the right edge the first time it appears (not on expand from the pill). */
  @keyframes lexiSlideIn {
    from { transform: translateX(calc(100% + 32px)); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .card.enter { animation: lexiSlideIn 450ms cubic-bezier(0.22, 0.9, 0.3, 1) backwards; }
  /* Collapsing to the pill and re-expanding are eased too (same easing and timing as the rest of the extension)
     instead of snapping: the card unfolds from its top-right corner, the pill fades and settles in. */
  @keyframes lexiUnfold {
    from { opacity: 0; transform: scale(0.94) translateY(-4px); }
    to { opacity: 1; transform: none; }
  }
  @keyframes lexiPillIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: none; }
  }
  /* only when the widget changes shape (.unfold / .settle) - a page simply loading with the widget already there
     shows it as it is, with no animation */
  .card.unfold { transform-origin: top right; animation: lexiUnfold 240ms cubic-bezier(0.22, 0.9, 0.3, 1) backwards; }
  .pill.settle { transform-origin: top right; animation: lexiPillIn 200ms cubic-bezier(0.22, 0.9, 0.3, 1) backwards; }
  @media (prefers-reduced-motion: reduce) { .card.enter, .card.unfold, .pill.settle { animation: none; } }

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

  .content { padding: ${u(26)} ${u(35)} 0 ${u(58)}; }
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

  /* footer pinned to the bottom, with a soft fade so the ruled lines ease out behind the button */
  .footer { margin-top: auto; box-sizing: border-box; min-height: ${u(100)}; padding: ${u(16)} ${u(36)} ${u(16)} ${u(58)};
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
  .footer::before { content: ""; position: absolute; left: 0; right: 0; top: ${u(-28)}; bottom: 0; pointer-events: none;
    background: linear-gradient(to bottom, rgba(247,243,234,0) 0, rgba(247,243,234,0.9) ${u(28)}, rgba(247,243,234,0.9) 100%); }
  .footer > * { position: relative; }
  /* the CTA: off-white, thin border, rounded, a soft shadow underneath */
  .saveBtn { display: inline-flex; align-items: center; gap: ${u(14)}; font-family: var(--sans); font-size: ${u(18)}; font-weight: 400; color: var(--ink-2);
    background: var(--off); border: 1.5px solid var(--border); border-radius: ${u(14)}; padding: ${u(13)} ${u(28)}; white-space: nowrap;
    box-shadow: 0 ${u(8)} ${u(14)} ${u(-8)} rgba(60,50,40,0.30); transition: background .15s; }
  .saveBtn:hover:not(:disabled) { background: #FFF9EE; }
  .saveBtn svg { width: ${u(22)}; height: ${u(22)}; }
  .saveBtn:disabled { cursor: default; opacity: 0.7; }
  .saveBtn.saved { cursor: default; opacity: 1; color: #4F7053; border-color: rgba(79,112,83,0.45); box-shadow: none; }
  .widgetErr { margin: 0; text-align: center; font-family: var(--sans); font-size: 10px; line-height: 14px; color: #a33; }
  .widgetErr:empty { display: none; }

  .pill { position: fixed; top: 16px; right: 16px; z-index: 2147483647; background: var(--paper); border: 1px solid var(--border);
    border-radius: 999px; box-shadow: 0 8px 20px rgba(0,0,0,0.16); color: var(--ink); padding: 10px 24px; cursor: pointer; }
  .pillWord { font-family: var(--serif); font-size: 19px; font-weight: 600; line-height: 28px; }
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

export function renderWidget(
  root: ShadowRoot,
  data: WidgetData,
  handlers: WidgetHandlers,
  collapsed: boolean,
  // animate: slide in (newly appearing). settle: animate the change between card and pill. saved: the word is
  // already in the library (saved from this or another tab), so the button starts in its "Added" state.
  opts: { animate?: boolean; settle?: boolean; saved?: boolean } = {}
): void {
  root.innerHTML = "";
  injectStyles(root);

  if (collapsed) {
    const pill = document.createElement("button");
    pill.className = opts.settle ? "pill settle" : "pill";
    pill.innerHTML = `<span class="pillWord"></span>`;
    pill.querySelector(".pillWord")!.textContent = data.word;
    pill.addEventListener("click", handlers.onToggleCollapse);
    root.appendChild(pill);
    return;
  }

  const card = document.createElement("section");
  card.className = opts.animate ? "card enter" : opts.settle ? "card unfold" : "card";
  card.setAttribute("aria-label", "Word of the day");
  card.innerHTML = `
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
  `;
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

  root.appendChild(card);
  fitWord(card);
  // The bundled fonts arrive a moment after first paint and change text widths, so measure again once they land.
  void loadLexiFonts().then(() => card.isConnected && fitWord(card));
  document.fonts?.ready.then(() => card.isConnected && fitWord(card));
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
  let lastCollapsed: boolean | null = null;

  return {
    update(view, opts = {}) {
      if (!view) {
        host?.remove();
        host = null;
        shadow = null;
        lastKey = "";
        lastCollapsed = null;
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
        lastCollapsed = null;
      }
      const key = JSON.stringify(view);
      if (key === lastKey) return;
      renderWidget(shadow!, view.data, handlers, view.collapsed, {
        // slide in only when it newly appears live; ease between card and pill when the shape changes
        animate: created && Boolean(opts.animate) && !view.collapsed,
        settle: !created && lastCollapsed !== null && lastCollapsed !== view.collapsed,
        saved: view.saved,
      });
      lastKey = key;
      lastCollapsed = view.collapsed;
    },
  };
}
