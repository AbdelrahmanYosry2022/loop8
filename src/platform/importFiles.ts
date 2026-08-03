import { isTauri } from "@tauri-apps/api/core";
import { basename } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";

export interface FbxSource {
  name: string;
  buffer: ArrayBuffer;
}

export function usesNativeFilePicker(): boolean {
  return isTauri();
}

export async function pickNativeFbxFile(): Promise<FbxSource | null> {
  if (!isTauri()) return null;

  const path = await open({
    multiple: false,
    directory: false,
    title: "اختار ملف FBX",
    filters: [{ name: "FBX animation", extensions: ["fbx"] }],
  });
  if (!path) return null;

  const bytes = await readFile(path);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return { name: await basename(path), buffer };
}
