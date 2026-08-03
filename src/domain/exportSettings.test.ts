import {
  BACKGROUND_MODES,
  DEFAULT_EXPORT_SETTINGS,
  EXPORT_FPS_OPTIONS,
  EXPORT_RESOLUTIONS,
  CAMERA_ZOOMS,
  CAMERA_ZOOM_FACTORS,
  VIDEO_BITRATES,
  VIDEO_QUALITIES,
} from "./exportSettings";

describe("export settings", () => {
  it("keeps the default export square and production friendly", () => {
    expect(DEFAULT_EXPORT_SETTINGS).toEqual({
      resolution: 1024,
      fps: 30,
      background: "studio",
      quality: "standard",
      zoom: "fit",
    });
  });

  it("offers only the compact supported presets", () => {
    expect(EXPORT_RESOLUTIONS).toEqual([512, 1024, 2048]);
    expect(EXPORT_FPS_OPTIONS).toEqual([24, 30, 60]);
    expect(BACKGROUND_MODES).toEqual(["studio", "transparent", "green"]);
    expect(VIDEO_QUALITIES).toEqual(["low", "standard", "high"]);
    expect(CAMERA_ZOOMS).toEqual(["close", "fit", "wide"]);
  });

  it("keeps quality and camera presets ordered from lighter to richer", () => {
    expect(VIDEO_BITRATES).toEqual({ low: 4_000_000, standard: 8_000_000, high: 16_000_000 });
    expect(CAMERA_ZOOM_FACTORS.close).toBeLessThan(CAMERA_ZOOM_FACTORS.fit);
    expect(CAMERA_ZOOM_FACTORS.wide).toBeGreaterThan(CAMERA_ZOOM_FACTORS.fit);
  });
});
