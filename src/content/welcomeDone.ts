import { FONT_BODY, FONT_DISPLAY, loadLexiFonts } from "../ui/fonts";

// What welcome.html shows once the onboarding dialog is finished (the dialog removes itself, which would otherwise
// leave a blank tab): a small paper note, and the tab closes itself after a few seconds.

export const WELCOME_CLOSE_MS = 8000;

export function showWelcomeDone(doc: Document, close: () => void, closeMs = WELCOME_CLOSE_MS): () => void {
  const style = doc.createElement("style");
  style.textContent = `
    :root { --paper: #F7F3EA; --off: #FFFDF8; --border: #D8D3C9; --ink: #171717; --ink-2: #45423E; --muted: #66615A;
      --rule: rgba(110,155,215,0.3); --margin: rgba(214,100,96,0.42); }
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;
      background: #E9E4D6; color: var(--ink); font-family: ${FONT_BODY}; }
    .note { position: relative; width: 420px; max-width: 100%; padding: 36px 32px 32px 64px; box-sizing: border-box; overflow: hidden;
      background: var(--paper); border: 1px solid var(--border); border-radius: 13px; box-shadow: 0 24px 60px rgba(0,0,0,0.14); }
    .note::before { content: ""; position: absolute; left: 0; right: 0; top: 83px; bottom: 0; pointer-events: none;
      background: repeating-linear-gradient(to bottom, transparent 0 35px, var(--rule) 35px 36px); }
    .note::after { content: ""; position: absolute; top: 0; bottom: 0; left: 40px; width: 1px; background: var(--margin); pointer-events: none; }
    .note > * { position: relative; z-index: 1; }
    h1 { margin: 0 0 12px; font: 600 20px/28px ${FONT_DISPLAY}; }
    p { margin: 0; font: 400 15px/36px ${FONT_BODY}; color: var(--ink-2); }
    .hint { margin-top: 12px; font-size: 13px; line-height: 20px; color: var(--muted); }
    button { margin-top: 20px; padding: 12px 26px; font: 400 14px ${FONT_BODY}; color: var(--ink-2); cursor: pointer;
      background: var(--off); border: 1.5px solid var(--border); border-radius: 14px; box-shadow: 0 8px 14px -8px rgba(60,50,40,0.30);
      transition: border-color 160ms ease, box-shadow 160ms ease, color 160ms ease; }
    button:hover { color: var(--ink); border-color: var(--ink-2); box-shadow: inset 0 0 0 0.5px var(--ink-2), 0 8px 14px -8px rgba(60,50,40,0.30); }
  `;
  const note = doc.createElement("div");
  note.className = "note";
  const h1 = doc.createElement("h1");
  h1.textContent = "You're all set";
  const p = doc.createElement("p");
  p.textContent = "Highlight any word on a page to start your library, or open Lexi from the toolbar to find new words.";
  const hint = doc.createElement("p");
  hint.className = "hint";
  hint.textContent = "This tab closes by itself in a few seconds.";
  const done = doc.createElement("button");
  done.type = "button";
  done.textContent = "Got it";
  note.append(h1, p, hint, done);
  doc.head.appendChild(style);
  doc.body.replaceChildren(note);
  void loadLexiFonts();

  const timer = setTimeout(close, closeMs);
  done.addEventListener("click", () => {
    clearTimeout(timer);
    close();
  });
  return () => clearTimeout(timer);
}
