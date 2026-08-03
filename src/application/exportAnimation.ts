import {
  buildExportFileName,
  VIEW_ANGLES,
  type LoopCount,
  type ViewAngle,
} from "../domain/angles";
import type { ExportSettings } from "../domain/exportSettings";
import type { ExportTarget } from "../platform/exportFiles";
import type { FbxPreviewEngine } from "../rendering/FbxPreviewEngine";
import { recordAlphaView } from "../rendering/recordAlphaView";
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
  settings: ExportSettings;
  target: ExportTarget;
  signal: AbortSignal;
  onProgress: (progress: ExportProgress) => void;
}

export async function exportAnimation({
  engine,
  sourceName,
  loops,
  settings,
  target,
  signal,
  onProgress,
}: ExportOptions): Promise<void> {
  engine.prepareExport(settings.resolution, settings.background);
  try {
    for (let index = 0; index < VIEW_ANGLES.length; index += 1) {
      const angle = VIEW_ANGLES[index];
      const updateProgress = (viewProgress: number) => {
        onProgress({
          angle,
          completedViews: index,
          totalProgress: (index + viewProgress) / VIEW_ANGLES.length,
        });
      };

      if (settings.background === "transparent") {
        if (!target.nativePath) {
          throw new Error("تصدير Alpha الحقيقي متاح في تطبيق Mac بس؛ استخدم Green Screen في المتصفح");
        }
        const fileName = buildExportFileName(sourceName, angle, "webm");
        await recordAlphaView({
          engine,
          angle,
          loops,
          fps: settings.fps,
          resolution: settings.resolution,
          outputPath: await target.nativePath(fileName),
          quality: settings.quality,
          signal,
          onProgress: updateProgress,
        });
      } else {
        const result = await recordView({
          engine,
          angle,
          loops,
          fps: settings.fps,
          background: settings.background,
          quality: settings.quality,
          signal,
          onProgress: updateProgress,
        });
        const fileName = buildExportFileName(sourceName, angle, result.format.extension);
        await target.save(fileName, result.blob);
      }
      onProgress({
        angle,
        completedViews: index + 1,
        totalProgress: (index + 1) / VIEW_ANGLES.length,
      });
    }
  } finally {
    engine.setAngle(0);
    engine.renderAt(0);
    engine.finishExport();
  }
}
