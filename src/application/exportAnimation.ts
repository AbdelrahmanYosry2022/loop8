import {
  buildExportFileName,
  VIEW_ANGLES,
  type LoopCount,
  type ViewAngle,
} from "../domain/angles";
import type { ExportTarget } from "../platform/exportFiles";
import type { FbxPreviewEngine } from "../rendering/FbxPreviewEngine";
import { recordView } from "../rendering/recordView";

export interface ExportProgress {
  angle: ViewAngle;
  completedViews: number;
  totalProgress: number;
}

interface ExportOptions {
  engine: FbxPreviewEngine;
  sourceName: string;
  loops: LoopCount;
  target: ExportTarget;
  signal: AbortSignal;
  onProgress: (progress: ExportProgress) => void;
}

export async function exportAnimation({
  engine,
  sourceName,
  loops,
  target,
  signal,
  onProgress,
}: ExportOptions): Promise<void> {
  engine.pause();
  try {
    for (let index = 0; index < VIEW_ANGLES.length; index += 1) {
      const angle = VIEW_ANGLES[index];
      const result = await recordView({
        engine,
        angle,
        loops,
        signal,
        onProgress: (viewProgress) => {
          onProgress({
            angle,
            completedViews: index,
            totalProgress: (index + viewProgress) / VIEW_ANGLES.length,
          });
        },
      });
      const fileName = buildExportFileName(sourceName, angle, result.format.extension);
      await target.save(fileName, result.blob);
      onProgress({
        angle,
        completedViews: index + 1,
        totalProgress: (index + 1) / VIEW_ANGLES.length,
      });
    }
  } finally {
    engine.setAngle(0);
    engine.renderAt(0);
    engine.play();
  }
}
