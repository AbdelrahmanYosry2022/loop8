export const EXPORT_RESOLUTIONS = [512, 1024, 2048] as const;
export const EXPORT_FPS_OPTIONS = [24, 30, 60] as const;
export const BACKGROUND_MODES = ["studio", "transparent", "green"] as const;
export const VIDEO_QUALITIES = ["low", "standard", "high"] as const;
export const CAMERA_ZOOMS = ["close", "fit", "wide"] as const;

export type ExportResolution = (typeof EXPORT_RESOLUTIONS)[number];
export type ExportFps = (typeof EXPORT_FPS_OPTIONS)[number];
export type BackgroundMode = (typeof BACKGROUND_MODES)[number];
export type VideoQuality = (typeof VIDEO_QUALITIES)[number];
export type CameraZoom = (typeof CAMERA_ZOOMS)[number];

export const VIDEO_BITRATES: Record<VideoQuality, number> = {
  low: 4_000_000,
  standard: 8_000_000,
  high: 16_000_000,
};

export const CAMERA_ZOOM_FACTORS: Record<CameraZoom, number> = {
  close: 0.82,
  fit: 1,
  wide: 1.65,
};

export interface ExportSettings {
  resolution: ExportResolution;
  fps: ExportFps;
  background: BackgroundMode;
  quality: VideoQuality;
  zoom: CameraZoom;
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  resolution: 1024,
  fps: 30,
  background: "studio",
  quality: "standard",
  zoom: "fit",
};
