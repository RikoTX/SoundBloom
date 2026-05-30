export function formatTrackForPlayer(track, source = "jamendo") {
  const audio = track.audio || track.music || track.audioUrl;
  const id = track.id ?? track.trackId;

  return {
    id: id != null ? String(id) : undefined,
    source: track.source || source,
    music: audio,
    audio,
    title: track.title,
    artist: track.artist,
    cover: track.cover,
    album: track.album,
  };
}

export function formatPlaylistForPlayer(tracks, source = "jamendo") {
  return tracks.map((track) => formatTrackForPlayer(track, source));
}

export function likeKey(source, trackId) {
  return `${source}:${trackId}`;
}

export function likedTrackToPlayer(track) {
  return {
    id: track.trackId,
    source: track.source,
    music: track.audioUrl,
    audio: track.audioUrl,
    title: track.title,
    artist: track.artist,
    cover: track.cover,
    album: track.album,
  };
}
