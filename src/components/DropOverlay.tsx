import { useRef, useState, type DragEvent } from "react";

interface DropOverlayProps {
  busy: boolean;
  nativePicker: boolean;
  onFile: (file: File) => void;
  onNativePick: () => void;
  onNativeBatch: () => void;
}

export function DropOverlay({
  busy,
  nativePicker,
  onFile,
  onNativePick,
  onNativeBatch,
}: DropOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const acceptFile = (file?: File) => {
    if (file?.name.toLowerCase().endsWith(".fbx")) onFile(file);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  };

  return (
    <>
      <button
        className={`drop-overlay ${dragging ? "is-dragging" : ""}`}
        type="button"
        disabled={busy}
        onClick={() => nativePicker ? onNativePick() : inputRef.current?.click()}
        onDragEnter={() => setDragging(true)}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <span className="drop-plus">+</span>
        <strong>{busy ? "بيفتح الحركة…" : "ارمِ ملف FBX هنا"}</strong>
      </button>
      <input
        ref={inputRef}
        hidden
        type="file"
        accept=".fbx"
        disabled={busy}
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />
      {nativePicker && (
        <button className="drop-folder" type="button" disabled={busy} onClick={onNativeBatch}>
          FOLDER+
        </button>
      )}
    </>
  );
}
