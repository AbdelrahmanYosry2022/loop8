import type { LoopCount, ViewAngle } from "../domain/angles";
import type { ExportSettings } from "../domain/exportSettings";
import type { ExportTarget } from "../platform/exportFiles";
import type { FbxSource } from "../platform/importFiles";
import type { FbxMetadata, FbxPreviewEngine } from "../rendering/FbxPreviewEngine";
import { exportAnimation } from "./exportAnimation";

export interface BatchExportProgress {
  angle: ViewAngle;
  sourceName: string;
  sourceIndex: number;
  sourceCount: number;
  totalProgress: number;
}

interface ExportBatchOptions {
  engine: FbxPreviewEngine;
  sources: FbxSource[];
  loops: LoopCount;
  settings: ExportSettings;
  target: ExportTarget;
  signal: AbortSignal;
  onSourceLoaded: (source: FbxSource, metadata: FbxMetadata) => void;
  onProgress: (progress: BatchExportProgress) => void;
}

export async function exportBatch({
  engine,
  sources,
  loops,
  settings,
  target,
  signal,
  onSourceLoaded,
  onProgress,
}: ExportBatchOptions): Promise<void> {
  for (let index = 0; index < sources.length; index += 1) {
    if (signal.aborted) throw new DOMException("Export cancelled", "AbortError");
    const source = sources[index];
    const metadata = await engine.load(await source.read());
    onSourceLoaded(source, metadata);

    await exportAnimation({
      engine,
      sourceName: source.exportName,
      loops,
      settings,
      target,
      signal,
      onProgress: ({ angle, totalProgress }) => {
        onProgress({
          angle,
          sourceName: source.name,
          sourceIndex: index,
          sourceCount: sources.length,
          totalProgress: (index + totalProgress) / sources.length,
        });
      },
    });
  }
}
