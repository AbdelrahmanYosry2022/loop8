import { recordingFormatCandidates } from "./recordView";

describe("recording formats", () => {
  it("routes transparent exports away from MediaRecorder", () => {
    expect(recordingFormatCandidates("transparent")).toEqual([]);
  });

  it("prefers MP4 for studio and green screen exports", () => {
    expect(recordingFormatCandidates("studio")[0].extension).toBe("mp4");
    expect(recordingFormatCandidates("green")[0].extension).toBe("mp4");
  });
});
