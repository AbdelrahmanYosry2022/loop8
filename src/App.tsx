import { useCallback, useRef, useState } from "react";
import { exportAnimation, type ExportProgress } from "./application/exportAnimation";
import { AngleRail } from "./components/AngleRail";
import { ControlBar } from "./components/ControlBar";
import { DropOverlay } from "./components/DropOverlay";
import { ExportStatus } from "./components/ExportStatus";
import { PreviewStage } from "./components/PreviewStage";
import type { LoopCount, ViewAngle } from "./domain/angles";
import { chooseExportTarget } from "./platform/exportFiles";
import { pickNativeFbxFile, usesNativeFilePicker } from "./platform/importFiles";
import type { FbxMetadata, FbxPreviewEngine } from "./rendering/FbxPreviewEngine";

type Status = "empty" | "loading" | "ready" | "exporting" | "done" | "error";

function App() {
  const engineRef = useRef<FbxPreviewEngine | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [status, setStatus] = useState<Status>("empty");
  const [sourceName, setSourceName] = useState("");
  const [metadata, setMetadata] = useState<FbxMetadata | null>(null);
  const [loops, setLoops] = useState<LoopCount>(1);
  const [angle, setAngle] = useState<ViewAngle>(0);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [message, setMessage] = useState("");

  const handleEngineReady = useCallback((engine: FbxPreviewEngine) => {
    engineRef.current = engine;
  }, []);

  const loadFbx = async (name: string, buffer: ArrayBuffer) => {
    const engine = engineRef.current;
    if (!engine) return;
    setStatus("loading");
    setMessage("");
    try {
      const result = await engine.load(buffer);
      setSourceName(name);
      setMetadata(result);
      setAngle(0);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "مقدرناش نفتح الملف");
    }
  };

  const handleFile = async (file: File) => loadFbx(file.name, await file.arrayBuffer());

  const handleNativePick = async () => {
    try {
      const source = await pickNativeFbxFile();
      if (source) await loadFbx(source.name, source.buffer);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "مقدرناش نفتح الملف");
    }
  };

  const handleAngle = (nextAngle: ViewAngle) => {
    setAngle(nextAngle);
    engineRef.current?.setAngle(nextAngle);
  };

  const handleExport = async () => {
    const engine = engineRef.current;
    if (!engine || !metadata) return;
    const target = await chooseExportTarget();
    if (!target) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("exporting");
    setMessage("");
    setProgress({ angle: 0, completedViews: 0, totalProgress: 0 });

    try {
      await exportAnimation({
        engine,
        sourceName,
        loops,
        target,
        signal: controller.signal,
        onProgress: setProgress,
      });
      setStatus("done");
      setMessage("اتصدّروا 8 فيديوهات بنجاح");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("ready");
      } else {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "التصدير وقف قبل ما يكتمل");
      }
    } finally {
      abortRef.current = null;
      setProgress(null);
    }
  };

  const hasModel = Boolean(metadata);
  const busy = status === "loading" || status === "exporting";

  return (
    <main className="app-shell">
      <header>
        <div className="brand"><span>8</span> LOOP</div>
        {hasModel && (
          <span className="file-name">{sourceName}</span>
        )}
      </header>

      <section className="stage">
        <PreviewStage onReady={handleEngineReady} />
        {!hasModel && (
          <DropOverlay
            busy={status === "loading"}
            nativePicker={usesNativeFilePicker()}
            onFile={handleFile}
            onNativePick={handleNativePick}
          />
        )}
        {hasModel && <AngleRail value={angle} disabled={busy} onChange={handleAngle} />}
        {message && <div className={`toast ${status === "error" ? "is-error" : ""}`}>{message}</div>}
      </section>

      {hasModel && status !== "exporting" && (
        <ControlBar loops={loops} disabled={busy} onLoopsChange={setLoops} onExport={handleExport} />
      )}
      {status === "exporting" && progress && (
        <ExportStatus progress={progress} onCancel={() => abortRef.current?.abort()} />
      )}
    </main>
  );
}

export default App;
