import { VIEW_ANGLES, type ViewAngle } from "../domain/angles";

interface AngleRailProps {
  value: ViewAngle;
  disabled: boolean;
  onChange: (angle: ViewAngle) => void;
}

export function AngleRail({ value, disabled, onChange }: AngleRailProps) {
  return (
    <div className="angle-rail" dir="ltr" aria-label="زاوية المعاينة">
      {VIEW_ANGLES.map((angle) => (
        <button
          key={angle}
          className={angle === value ? "is-active" : ""}
          type="button"
          disabled={disabled}
          onClick={() => onChange(angle)}
        >
          {angle}°
        </button>
      ))}
    </div>
  );
}
