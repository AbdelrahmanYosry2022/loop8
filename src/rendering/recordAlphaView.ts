import { invoke, isTauri } from "@tauri-apps/api/core";
import type { LoopCount, ViewAngle } from "../domain/angles";
import type { ExportFps, ExportResolution, VideoQuality } from "../domain/exportSettings";
import type { FbxPreviewEngine } from "./FbxPreviewEngine";

interface RecordAlphaOptions {
  engine: FbxPreviewEngine;
  angle: ViewAngle;
  loops: LoopCount;
  fps: ExportFps;
  resolution: ExportResolution;
  outputPath: string;
  quality: VideoQuality;
  signal: AbortSignal;
  onProgress: (progress: number) => void;
}

export async function recordAlphaView({
  engine,
  angle,
  loops,
  fps,
  resolution,
  outputPath,
  quality,
  signal,
  onProgress,
}: RecordAlphaOptions): Promise<void> {
  if (!isTauri()) {
    throw new Error("تصدير Alpha الحقيقي متاح في تطبيق Mac بس؛ استخدم Green Screen في المتصفح");
  }

  const totalSeconds = engine.duration * loops;
  const frameCount = Math.max(Math.ceil(totalSeconds * fps), 1);
  engine.setAngle(angle);
  engine.renderAt(0);
  await invoke("start_alpha_export", {
    outputPath,
    width: resolution,
    height: resolution,
    fps,
    quality,
  });

  try {
    for (let frame = 0; frame < frameCount; frame += 1) {
      if (signal.aborted) throw new DOMException("Export cancelled", "AbortError");
      engine.renderAt(Math.min(frame / fps, Math.max(totalSeconds - 1 / fps, 0)));
      await invoke("write_alpha_frame", engine.readRgbaFrame());
      onProgress((frame + 1) / frameCount);
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    await invoke("finish_alpha_export");
  } catch (error) {
    await invoke("cancel_alpha_export").catch(() => undefined);
    throw error;
  }
}
