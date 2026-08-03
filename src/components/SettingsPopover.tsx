import {
  CAMERA_ZOOMS,
  EXPORT_FPS_OPTIONS,
  EXPORT_RESOLUTIONS,
  VIDEO_QUALITIES,
  type BackgroundMode,
  type CameraZoom,
  type ExportSettings,
  type VideoQuality,
} from "../domain/exportSettings";

interface SettingsPopoverProps {
  settings: ExportSettings;
  onChange: (settings: ExportSettings) => void;
}

const BACKGROUNDS: Array<{ value: BackgroundMode; label: string }> = [
  { value: "studio", label: "STUDIO" },
  { value: "transparent", label: "ALPHA" },
  { value: "green", label: "GREEN" },
];

const QUALITY_LABELS: Record<VideoQuality, string> = {
  low: "LOW",
  standard: "MED",
  high: "HIGH",
};

const ZOOM_LABELS: Record<CameraZoom, string> = {
  close: "CLOSE",
  fit: "FIT",
  wide: "WIDE",
};

export function SettingsPopover({ settings, onChange }: SettingsPopoverProps) {
  return (
    <div className="settings-popover" role="dialog" aria-label="إعدادات التصدير">
      <div className="setting-row">
        <span>BG</span>
        <div className="setting-options">
          {BACKGROUNDS.map(({ value, label }) => (
            <button
              key={value}
              className={`background-option is-${value} ${settings.background === value ? "is-active" : ""}`}
              type="button"
              title={value === "transparent" ? "Transparent WebM" : label}
              onClick={() => onChange({ ...settings, background: value })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-row">
        <span>SIZE</span>
        <div className="setting-options">
          {EXPORT_RESOLUTIONS.map((resolution) => (
            <button
              key={resolution}
              className={settings.resolution === resolution ? "is-active" : ""}
              type="button"
              onClick={() => onChange({ ...settings, resolution })}
            >
              {resolution}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-row">
        <span>QUALITY</span>
        <div className="setting-options">
          {VIDEO_QUALITIES.map((quality) => (
            <button
              key={quality}
              className={settings.quality === quality ? "is-active" : ""}
              type="button"
              title={`${QUALITY_LABELS[quality]} video quality`}
              onClick={() => onChange({ ...settings, quality })}
            >
              {QUALITY_LABELS[quality]}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-row">
        <span>ZOOM</span>
        <div className="setting-options">
          {CAMERA_ZOOMS.map((zoom) => (
            <button
              key={zoom}
              className={settings.zoom === zoom ? "is-active" : ""}
              type="button"
              title={`${ZOOM_LABELS[zoom]} camera distance`}
              onClick={() => onChange({ ...settings, zoom })}
            >
              {ZOOM_LABELS[zoom]}
            </button>
          ))}
        </div>
      </div>

      <div className="setting-row">
        <span>FPS</span>
        <div className="setting-options">
          {EXPORT_FPS_OPTIONS.map((fps) => (
            <button
              key={fps}
              className={settings.fps === fps ? "is-active" : ""}
              type="button"
              onClick={() => onChange({ ...settings, fps })}
            >
              {fps}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
