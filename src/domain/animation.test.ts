import { AnimationClip, NumberKeyframeTrack, VectorKeyframeTrack } from "three";
import { lockHorizontalRootMotion } from "./animation";

describe("root motion", () => {
  it("locks horizontal hips movement while preserving height", () => {
    const hips = new VectorKeyframeTrack(
      "mixamorigHips.position",
      [0, 1],
      [1, 2, 3, 8, 4, 9],
    );
    const rotation = new NumberKeyframeTrack("mesh.rotation[y]", [0, 1], [0, 1]);
    const clip = new AnimationClip("run", 1, [hips, rotation]);

    const locked = lockHorizontalRootMotion(clip);
    expect(Array.from(locked.tracks[0].values)).toEqual([1, 2, 3, 1, 4, 3]);
    expect(Array.from(locked.tracks[1].values)).toEqual([0, 1]);
    expect(locked).not.toBe(clip);
  });
});
