import { useEffect, useRef } from "react";
import { FbxPreviewEngine } from "../rendering/FbxPreviewEngine";

interface PreviewStageProps {
  onReady: (engine: FbxPreviewEngine) => void;
}

export function PreviewStage({ onReady }: PreviewStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new FbxPreviewEngine(canvasRef.current);
    onReady(engine);
    return () => engine.dispose();
  }, [onReady]);

  return <canvas ref={canvasRef} className="preview-canvas" aria-label="معاينة الحركة" />;
}
