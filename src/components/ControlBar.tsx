import type { LoopCount } from "../domain/angles";

interface ControlBarProps {
  loops: LoopCount;
  disabled: boolean;
  onLoopsChange: (loops: LoopCount) => void;
  onExport: () => void;
}

export function ControlBar({ loops, disabled, onLoopsChange, onExport }: ControlBarProps) {
  return (
    <div className="control-bar">
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
      <button className="export-button" type="button" disabled={disabled} onClick={onExport}>
        صدّر 8 زوايا
        <span aria-hidden="true">↗</span>
      </button>
    </div>
  );
}
