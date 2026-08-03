import { buildExportFileName, cleanExportName, formatAngle } from "./angles";

describe("angle export naming", () => {
  it("pads view angles to three digits", () => {
    expect(formatAngle(0)).toBe("000");
    expect(formatAngle(45)).toBe("045");
    expect(formatAngle(315)).toBe("315");
  });

  it("keeps Arabic names and removes unsafe path characters", () => {
    expect(cleanExportName("حركة جري / نهائي.fbx")).toBe("حركة-جري-نهائي");
  });

  it("builds a stable angle filename", () => {
    expect(buildExportFileName("run.fbx", 90, "mp4")).toBe("run_090.mp4");
  });
});
