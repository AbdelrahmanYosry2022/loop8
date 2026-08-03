import type { FbxPreviewEngine } from "./FbxPreviewEngine";
import { recordAlphaView } from "./recordAlphaView";

const tauri = vi.hoisted(() => ({ invoke: vi.fn() }));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: tauri.invoke,
  isTauri: () => true,
}));

describe("recordAlphaView", () => {
  beforeEach(() => tauri.invoke.mockReset().mockResolvedValue(undefined));

  it("streams every rendered RGBA frame to the native alpha encoder", async () => {
    const engine = {
      duration: 0.1,
      setAngle: vi.fn(),
      renderAt: vi.fn(),
      readRgbaFrame: vi.fn(() => new Uint8Array([0, 0, 0, 0])),
    } as unknown as FbxPreviewEngine;

    await recordAlphaView({
      engine,
      angle: 45,
      loops: 1,
      fps: 24,
      resolution: 512,
      outputPath: "/tmp/loop8-alpha.webm",
      quality: "high",
      signal: new AbortController().signal,
      onProgress: vi.fn(),
    });

    expect(tauri.invoke).toHaveBeenNthCalledWith(1, "start_alpha_export", {
      outputPath: "/tmp/loop8-alpha.webm",
      width: 512,
      height: 512,
      fps: 24,
      quality: "high",
    });
    expect(tauri.invoke.mock.calls.filter(([command]) => command === "write_alpha_frame")).toHaveLength(3);
    expect(tauri.invoke).toHaveBeenLastCalledWith("finish_alpha_export");
  });
});
