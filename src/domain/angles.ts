export const VIEW_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315] as const;

export type ViewAngle = (typeof VIEW_ANGLES)[number];
export type LoopCount = 1 | 2 | 3;

export function formatAngle(angle: ViewAngle): string {
  return angle.toString().padStart(3, "0");
}

export function cleanExportName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.fbx$/i, "");
  const clean = withoutExtension
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/^-+|-+$/g, "");

  return clean || "animation";
}

export function buildExportFileName(
  baseName: string,
  angle: ViewAngle,
  extension: "mp4" | "webm",
): string {
  return `${cleanExportName(baseName)}_${formatAngle(angle)}.${extension}`;
}
