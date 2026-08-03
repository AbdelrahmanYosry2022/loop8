import { VIDEO_BITRATES } from "../domain/exportSettings";
import { recordingFormatCandidates } from "./recordView";

describe("recording formats", () => {
  it("routes transparent exports away from MediaRecorder", () => {
    expect(recordingFormatCandidates("transparent")).toEqual([]);
  });

  it("prefers MP4 for studio and green screen exports", () => {
    expect(recordingFormatCandidates("studio")[0].extension).toBe("mp4");
    expect(recordingFormatCandidates("green")[0].extension).toBe("mp4");
  });

  it("maps the three quality presets to increasing bitrates", () => {
    expect(VIDEO_BITRATES.low).toBe(4_000_000);
    expect(VIDEO_BITRATES.standard).toBe(8_000_000);
    expect(VIDEO_BITRATES.high).toBe(16_000_000);
  });
});
