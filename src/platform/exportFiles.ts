import { isTauri } from "@tauri-apps/api/core";
import { join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";

export interface ExportTarget {
  save: (fileName: string, blob: Blob) => Promise<void>;
  nativePath?: (fileName: string) => Promise<string>;
}

function downloadInBrowser(fileName: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function chooseExportTarget(): Promise<ExportTarget | null> {
  if (!isTauri()) {
    return { save: async (fileName, blob) => downloadInBrowser(fileName, blob) };
  }

  const directory = await open({ directory: true, multiple: false, title: "اختار فولدر التصدير" });
  if (!directory) return null;

  return {
    nativePath: (fileName) => join(directory, fileName),
    save: async (fileName, blob) => {
      const outputPath = await join(directory, fileName);
      await writeFile(outputPath, new Uint8Array(await blob.arrayBuffer()));
    },
  };
}
