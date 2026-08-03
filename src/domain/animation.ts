import { AnimationClip, KeyframeTrack, VectorKeyframeTrack } from "three";

const ROOT_POSITION_TRACK = /(?:hips|root)\.position$/i;

function lockTrack(track: KeyframeTrack): KeyframeTrack {
  if (!(track instanceof VectorKeyframeTrack) || !ROOT_POSITION_TRACK.test(track.name)) {
    return track.clone();
  }

  const values = track.values.slice();
  for (let index = 0; index < values.length; index += 3) {
    values[index] = values[0];
    values[index + 2] = values[2];
  }

  return new VectorKeyframeTrack(
    track.name,
    track.times.slice(),
    values,
    track.getInterpolation(),
  );
}

export function lockHorizontalRootMotion(clip: AnimationClip): AnimationClip {
  return new AnimationClip(clip.name, clip.duration, clip.tracks.map(lockTrack));
}
