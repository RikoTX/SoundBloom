export function parseDurationSeconds(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

export function sumDurationsSeconds(tracks) {
  if (!tracks?.length) return 0;
  return tracks.reduce(
    (sum, track) => sum + parseDurationSeconds(track.duration),
    0
  );
}

export function formatTotalDuration(totalSec) {
  const sec = Math.floor(parseDurationSeconds(totalSec));
  if (sec <= 0) return "0m 0s";

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatTotalDurationFromTracks(tracks) {
  return formatTotalDuration(sumDurationsSeconds(tracks));
}
