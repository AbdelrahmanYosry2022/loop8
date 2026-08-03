import type { BatchExportProgress } from "../application/exportBatch";

interface ExportStatusProps {
  progress: BatchExportProgress;
  onCancel: () => void;
}

export function ExportStatus({ progress, onCancel }: ExportStatusProps) {
  const percent = Math.round(progress.totalProgress * 100);
  return (
    <div className="export-status" role="status">
      <div className="progress-copy">
        <strong>{percent}%</strong>
        <span title={progress.sourceName}>
          {progress.sourceIndex + 1}/{progress.sourceCount} · {progress.angle}°
        </span>
      </div>
      <div className="progress-track" aria-label={`تم ${percent}%`}>
        <span style={{ width: `${percent}%` }} />
      </div>
      <button type="button" onClick={onCancel}>إلغاء</button>
    </div>
  );
}
