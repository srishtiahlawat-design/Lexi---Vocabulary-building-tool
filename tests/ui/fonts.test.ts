import { describe, it, expect, vi } from "vitest";
import { createFontLoader, FONT_FILES, FONT_DISPLAY, FONT_BODY } from "../../src/ui/fonts";

function makeDeps(files: Record<string, string> | undefined) {
  const added: unknown[] = [];
  const faces: { family: string; weight: string; size: number }[] = [];
  return {
    added,
    faces,
    deps: {
      getFiles: vi.fn().mockResolvedValue(files),
      createFace: (family: string, data: ArrayBuffer, weight: string) => {
        faces.push({ family, weight, size: data.byteLength });
        return { load: () => Promise.resolve() };
      },
      fontSet: { add: (f: unknown) => added.push(f) },
    },
  };
}

const ALL = Object.fromEntries(FONT_FILES.map((f) => [f.file, btoa("abc")]));

describe("font loader", () => {
  it("registers every bundled face from the bytes it is given", async () => {
    const { deps, added, faces } = makeDeps(ALL);
    expect(await createFontLoader(deps)()).toBe(true);
    expect(added).toHaveLength(FONT_FILES.length);
    expect(faces.map((f) => f.family)).toEqual(FONT_FILES.map((f) => f.family));
    expect(faces.every((f) => f.size === 3)).toBe(true);
  });

  it("only asks for the files once however often it is called", async () => {
    const { deps } = makeDeps(ALL);
    const load = createFontLoader(deps);
    await Promise.all([load(), load()]);
    await load();
    expect(deps.getFiles).toHaveBeenCalledOnce();
  });

  it("resolves false, without throwing, when the files can't be reached", async () => {
    expect(await createFontLoader(makeDeps(undefined).deps)()).toBe(false);
    const failing = makeDeps(ALL);
    failing.deps.getFiles.mockRejectedValue(new Error("context invalidated"));
    expect(await createFontLoader(failing.deps)()).toBe(false);
  });

  it("skips a missing or broken file and keeps the rest", async () => {
    const { deps, added } = makeDeps({ [FONT_FILES[0].file]: btoa("abc") });
    expect(await createFontLoader(deps)()).toBe(true);
    expect(added).toHaveLength(1);
  });

  it("uses family names a host page is unlikely to define, with a fallback behind each", () => {
    expect(FONT_DISPLAY).toMatch(/^'Lexi Klee One'/);
    expect(FONT_BODY).toMatch(/^'Lexi Geist'/);
    expect(FONT_DISPLAY).toMatch(/serif$/);
    expect(FONT_BODY).toMatch(/sans-serif$/);
  });
});
