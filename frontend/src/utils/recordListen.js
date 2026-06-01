import { getListenerKey } from "./listenerKey";
import { recordCatalogListen } from "../api/catalogApi";

const lastRecorded = { trackId: null, at: 0 };
const MIN_INTERVAL_MS = 120_000;

export function recordSoundbloomListen(track) {
  if (!track?.id || track.source !== "soundbloom") return;

  const now = Date.now();
  if (
    lastRecorded.trackId === track.id &&
    now - lastRecorded.at < MIN_INTERVAL_MS
  ) {
    return;
  }

  lastRecorded.trackId = track.id;
  lastRecorded.at = now;

  recordCatalogListen(track.id, getListenerKey()).catch(() => {});
}
