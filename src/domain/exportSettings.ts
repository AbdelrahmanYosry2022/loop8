export const EXPORT_RESOLUTIONS = [512, 1024, 2048] as const;
export const EXPORT_FPS_OPTIONS = [24, 30, 60] as const;
export const BACKGROUND_MODES = ["studio", "transparent", "green"] as const;

export type ExportResolution = (typeof EXPORT_RESOLUTIONS)[number];
export type ExportFps = (typeof EXPORT_FPS_OPTIONS)[number];
export type BackgroundMode = (typeof BACKGROUND_MODES)[number];

export interface ExportSettings {
  resolution: ExportResolution;
  fps: ExportFps;
  background: BackgroundMode;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  resolution: 1024,
  fps: 30,
  background: "studio",
};
