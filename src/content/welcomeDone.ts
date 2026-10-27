import { FONT_BODY, FONT_DISPLAY, loadLexiFonts } from "../ui/fonts";

// What welcome.html shows once the onboarding dialog is finished (the dialog removes itself, which would otherwise
// leave a blank tab): a small paper note about adding the API key. The tab closes only when the user clicks "Got it".

export function showWelcomeDone(doc: Document, close: () => void, openOptions: () => void): void {
  const style = doc.createElement("style");
  style.textContent = `
    :root { --paper: #F7F3EA; --off: #FFFDF8; --border: #D8D3C9; --ink: #171717; --ink-2: #45423E; --muted: #66615A;
      --rule: rgba(110,155,215,0.3); --margin: rgba(214,100,96,0.42); }
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;
      background: #E9E4D6; color: var(--ink); font-family: ${FONT_BODY}; }
    .note { position: relative; width: 420px; max-width: 100%; padding: 36px 32px 36px 64px; box-sizing: border-box; overflow: hidden;
      background: var(--paper); border: 1px solid var(--border); border-radius: 13px; box-shadow: 0 24px 60px rgba(0,0,0,0.14); }
    .note::before { content: ""; position: absolute; left: 0; right: 0; top: 0; bottom: 0; pointer-events: none;
      background: repeating-linear-gradient(to bottom, transparent 0 35px, var(--rule) 35px 36px); }
    .note::after { content: ""; position: absolute; top: 0; bottom: 0; left: 40px; width: 1px; background: var(--margin); pointer-events: none; }
    .note > * { position: relative; z-index: 1; }
    h1 { margin: 0; font: 600 20px/36px ${FONT_DISPLAY}; }
    p { margin: 0; font: 400 15px/36px ${FONT_BODY}; color: var(--ink-2); }
    .actions { margin-top: 14px; display: flex; gap: 12px; flex-wrap: wrap; }
    button { padding: 12px 26px; font: 400 14px ${FONT_BODY}; color: var(--ink-2); cursor: pointer;
      background: var(--off); border: 1.5px solid var(--border); border-radius: 14px; box-shadow: 0 8px 14px -8px rgba(60,50,40,0.30);
      transition: border-color 160ms ease, box-shadow 160ms ease, color 160ms ease; }
    button:hover { color: var(--ink); border-color: var(--ink-2); box-shadow: inset 0 0 0 0.5px var(--ink-2), 0 8px 14px -8px rgba(60,50,40,0.30); }
  `;
  const note = doc.createElement("div");
  note.className = "note";
  const h1 = doc.createElement("h1");
  h1.textContent = "You're all set";
  const p = doc.createElement("p");
  p.textContent =
    "Lexi needs an API key to look up words. Add yours on the settings page: right-click the Lexi icon in the toolbar and choose Options, or use the button below.";
  const p2 = doc.createElement("p");
  p2.textContent = "Then highlight any word on a page to start your library.";
  const actions = doc.createElement("div");
  actions.className = "actions";
  const key = doc.createElement("button");
  key.type = "button";
  key.textContent = "Add my API key";
  key.addEventListener("click", openOptions);
  const done = doc.createElement("button");
  done.type = "button";
  done.textContent = "Got it";
  done.addEventListener("click", close);
  actions.append(key, done);
  note.append(h1, p, p2, actions);
  doc.head.appendChild(style);
  doc.body.replaceChildren(note);
  void loadLexiFonts();
}
