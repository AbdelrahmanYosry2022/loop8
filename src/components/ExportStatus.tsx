import type { ExportProgress } from "../application/exportAnimation";

interface ExportStatusProps {
  progress: ExportProgress;
  onCancel: () => void;
}

export function ExportStatus({ progress, onCancel }: ExportStatusProps) {
  const percent = Math.round(progress.totalProgress * 100);
  return (
    <div className="export-status" role="status">
      <div className="progress-copy">
        <strong>{percent}%</strong>
        <span>{progress.angle}°</span>
      </div>
      <div className="progress-track" aria-label={`تم ${percent}%`}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <button type="button" onClick={onCancel}>إلغاء</button>
    </div>
  );
}
