import type { LoopCount, ViewAngle } from "../domain/angles";
import type { FbxPreviewEngine } from "./FbxPreviewEngine";

export interface RecordingFormat {
  mimeType: string;
  extension: "mp4" | "webm";
}

const MIME_TYPES: RecordingFormat[] = [
  { mimeType: "video/mp4;codecs=avc1.42E01E", extension: "mp4" },
  { mimeType: "video/mp4", extension: "mp4" },
  { mimeType: "video/webm;codecs=vp9", extension: "webm" },
  { mimeType: "video/webm;codecs=vp8", extension: "webm" },
  { mimeType: "video/webm", extension: "webm" },
];

export function selectRecordingFormat(): RecordingFormat {
  const format = MIME_TYPES.find(({ mimeType }) => MediaRecorder.isTypeSupported(mimeType));
  if (!format) throw new Error("الجهاز مش بيدعم تسجيل الفيديو من المعاينة");
  return format;
}

interface RecordOptions {
  engine: FbxPreviewEngine;
  angle: ViewAngle;
  loops: LoopCount;
  signal: AbortSignal;
  onProgress: (progress: number) => void;
}

export async function recordView({
  engine,
  angle,
  loops,
  signal,
  onProgress,
}: RecordOptions): Promise<{ blob: Blob; format: RecordingFormat }> {
  if (!("MediaRecorder" in window) || !("captureStream" in engine.canvas)) {
    throw new Error("نسخة النظام الحالية مش بتدعم تسجيل Canvas");
  }

  const format = selectRecordingFormat();
  const totalSeconds = engine.duration * loops;
  engine.setAngle(angle);
  engine.renderAt(0);

  const stream = engine.canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: format.mimeType,
    videoBitsPerSecond: 8_000_000,
  });
  const chunks: BlobPart[] = [];
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });

  const stopped = new Promise<void>((resolve, reject) => {
    recorder.addEventListener("stop", () => resolve(), { once: true });
    recorder.addEventListener("error", () => reject(new Error("حصل خطأ أثناء تسجيل الفيديو")), {
      once: true,
    });
  });

  recorder.start(500);
  const startedAt = performance.now();

  try {
    await new Promise<void>((resolve, reject) => {
      const renderFrame = (now: number) => {
        if (signal.aborted) {
          reject(new DOMException("Export cancelled", "AbortError"));
          return;
        }

        const elapsed = (now - startedAt) / 1000;
        const bounded = Math.min(elapsed, Math.max(totalSeconds - 1 / 30, 0));
        engine.renderAt(bounded);
        onProgress(Math.min(elapsed / totalSeconds, 1));

        if (elapsed >= totalSeconds) resolve();
        else requestAnimationFrame(renderFrame);
      };
      requestAnimationFrame(renderFrame);
    });
  } finally {
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;
    stream.getTracks().forEach((track) => track.stop());
  }

  return { blob: new Blob(chunks, { type: format.mimeType }), format };
}
