import { isTauri } from "@tauri-apps/api/core";
import { basename, join } from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { readDir, readFile } from "@tauri-apps/plugin-fs";

export interface FbxSource {
  id: string;
  name: string;
  exportName: string;
  read: () => Promise<ArrayBuffer>;
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

  const name = await basename(path);
  return createNativeSource(path, name, name);
}

export function createBrowserFbxSource(file: File): FbxSource {
  return {
    id: `${file.name}:${file.size}:${file.lastModified}`,
    name: file.name,
    exportName: file.name,
    read: () => file.arrayBuffer(),
  };
}

export async function pickNativeFbxFolder(): Promise<FbxSource[] | null> {
  if (!isTauri()) return null;
  const directory = await open({
    directory: true,
    multiple: false,
    recursive: true,
    title: "اختار فولدر حركات FBX",
  });
  if (!directory) return null;

  const files = await collectFbxPaths(directory);
  return files
    .sort((left, right) => left.relative.localeCompare(right.relative))
    .map(({ path, relative }) =>
      createNativeSource(path, relative.split("/").at(-1) ?? relative, relative.replaceAll("/", "__")),
    );
}

function createNativeSource(path: string, name: string, exportName: string): FbxSource {
  return {
    id: path,
    name,
    exportName,
    read: async () => {
      const bytes = await readFile(path);
      return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    },
  };
}

async function collectFbxPaths(
  directory: string,
  prefix = "",
): Promise<Array<{ path: string; relative: string }>> {
  const files: Array<{ path: string; relative: string }> = [];
  for (const entry of await readDir(directory)) {
    const path = await join(directory, entry.name);
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isFile && entry.name.toLowerCase().endsWith(".fbx")) {
      files.push({ path, relative });
    } else if (entry.isDirectory && !entry.isSymlink) {
      files.push(...await collectFbxPaths(path, relative));
    }
  }
  return files;
}
