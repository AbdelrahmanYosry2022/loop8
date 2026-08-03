import {
  BACKGROUND_MODES,
  DEFAULT_EXPORT_SETTINGS,
  EXPORT_FPS_OPTIONS,
  EXPORT_RESOLUTIONS,
} from "./exportSettings";

describe("export settings", () => {
  it("keeps the default export square and production friendly", () => {
    expect(DEFAULT_EXPORT_SETTINGS).toEqual({
      resolution: 1024,
      fps: 30,
      background: "studio",
    });
  });

  it("offers only the compact supported presets", () => {
    expect(EXPORT_RESOLUTIONS).toEqual([512, 1024, 2048]);
    expect(EXPORT_FPS_OPTIONS).toEqual([24, 30, 60]);
    expect(BACKGROUND_MODES).toEqual(["studio", "transparent", "green"]);
  });
});
