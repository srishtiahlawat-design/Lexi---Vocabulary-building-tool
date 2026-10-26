import { requestFonts } from "../lib/messages";

// Lexi's two typefaces, bundled in the extension (fonts/) rather than loaded from Google Fonts: nothing is
// fetched from a third party on every page the user visits, they work offline, and a strict page CSP can't
// block them. Both are under the SIL Open Font License (fonts/OFL-*.txt).
//   Klee One - handwriting-style display face for the word, pronunciation, meaning and example.
//   Geist    - neutral sans for labels, dates, buttons, meanings and everything small.
// The family names are prefixed so a host page that defines its own "Geist" can't change how Lexi looks.
export const DISPLAY_FAMILY = "Lexi Klee One";
export const BODY_FAMILY = "Lexi Geist";

// The fallbacks only show before the files arrive (or if they can't be loaded at all).
export const FONT_DISPLAY = `'${DISPLAY_FAMILY}', 'Klee One', Georgia, 'Times New Roman', serif`;
export const FONT_BODY = `'${BODY_FAMILY}', 'Geist', -apple-system, 'Segoe UI', Roboto, sans-serif`;

export interface FontFileSpec {
  file: string;
  family: string;
  weight: string; // a single weight or a range, as in CSS @font-face
}

export const FONT_FILES: FontFileSpec[] = [
  { file: "KleeOne-Regular.woff2", family: DISPLAY_FAMILY, weight: "400" },
  { file: "KleeOne-SemiBold.woff2", family: DISPLAY_FAMILY, weight: "600" },
  { file: "Geist-Variable.woff2", family: BODY_FAMILY, weight: "400 600" }, // variable: covers 400, 500 and 600
];

export interface FontLoaderDeps {
  // file name -> base64 contents, as served by the background worker; undefined if it can't be reached
  getFiles(): Promise<Record<string, string> | undefined>;
  createFace(family: string, data: ArrayBuffer, weight: string): { load(): Promise<unknown> };
  fontSet: { add(face: unknown): unknown };
}

function decodeBase64(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

// Registers the bundled fonts with the page's font set. Faces are built from raw bytes (not a url()), which is
// what keeps them out of the host page's CSP font-src rules. Runs once; every later call shares the same promise.
// Resolves true when at least one face is ready - it never rejects, so the widget just keeps its fallback fonts.
export function createFontLoader(deps: FontLoaderDeps): () => Promise<boolean> {
  let pending: Promise<boolean> | null = null;
  return () => {
    pending ??= (async () => {
      try {
        const files = await deps.getFiles();
        if (!files) return false;
        let any = false;
        for (const spec of FONT_FILES) {
          const b64 = files[spec.file];
          if (!b64) continue;
          try {
            const face = deps.createFace(spec.family, decodeBase64(b64), spec.weight);
            await face.load();
            deps.fontSet.add(face);
            any = true;
          } catch {
            // one bad file shouldn't take the others down
          }
        }
        return any;
      } catch {
        return false;
      }
    })();
    return pending;
  };
}

let browserLoader: (() => Promise<boolean>) | null = null;

// Real wiring for a content script. A no-op where FontFace isn't available (unit tests).
export function loadLexiFonts(): Promise<boolean> {
  if (typeof FontFace === "undefined" || typeof document === "undefined" || !document.fonts) return Promise.resolve(false);
  browserLoader ??= createFontLoader({
    getFiles: requestFonts,
    createFace: (family, data, weight) => new FontFace(family, data, { weight, style: "normal", display: "swap" }),
    fontSet: document.fonts,
  });
  return browserLoader();
}
