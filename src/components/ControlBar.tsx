import { useState } from "react";
import type { LoopCount } from "../domain/angles";
import type { ExportSettings } from "../domain/exportSettings";
import { SettingsPopover } from "./SettingsPopover";

interface ControlBarProps {
  loops: LoopCount;
  settings: ExportSettings;
  sourceCount: number;
  disabled: boolean;
  onAdd: () => void;
  onBatch: () => void;
  onLoopsChange: (loops: LoopCount) => void;
  onSettingsChange: (settings: ExportSettings) => void;
  onExport: () => void;
}

export function ControlBar({
  loops,
  settings,
  sourceCount,
  disabled,
  onAdd,
  onBatch,
  onLoopsChange,
  onSettingsChange,
  onExport,
}: ControlBarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="control-bar">
      {settingsOpen && <SettingsPopover settings={settings} onChange={onSettingsChange} />}
      <div className="control-cluster">
        <div className="loops" aria-label="عدد مرات تكرار الحركة">
          <span>LOOPS</span>
          {([1, 2, 3] as const).map((count) => (
            <button
              key={count}
              className={loops === count ? "is-active" : ""}
              type="button"
              disabled={disabled}
              onClick={() => onLoopsChange(count)}
            >
              {count}
            </button>
          ))}
        </div>
        <button className="tool-button" type="button" disabled={disabled} onClick={onAdd}>
          + FBX
        </button>
        <button className="tool-button" type="button" disabled={disabled} onClick={onBatch}>
          FOLDER+
        </button>
        <button
          className={`tool-button settings-button ${settingsOpen ? "is-active" : ""}`}
          type="button"
          disabled={disabled}
          aria-label="إعدادات التصدير"
          aria-expanded={settingsOpen}
          onClick={() => setSettingsOpen((open) => !open)}
        >
          ⚙
        </button>
      </div>
      <button className="export-button" type="button" disabled={disabled} onClick={onExport}>
        {sourceCount > 1 ? `صدّر ${sourceCount} × 8` : "صدّر 8 زوايا"}
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
