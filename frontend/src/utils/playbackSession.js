let playbackActive = false;

export function setPlaybackActive(value) {
  playbackActive = Boolean(value);
}

export function isPlaybackActive() {
  return playbackActive;
}
