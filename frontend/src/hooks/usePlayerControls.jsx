export default function usePlayerControls(setCurrentPlaylist, setCurrentTrackIndex) {
  const handlePlaySong = (playlist, index) => {
    setCurrentTrackIndex(null);
    setCurrentPlaylist(null);
    setTimeout(() => {
      setCurrentPlaylist(playlist);
      setCurrentTrackIndex(index);
    }, 10);
  };

  const stopPlayback = () => {
    setCurrentTrackIndex(null);
    setCurrentPlaylist(null);
  };

  return { handlePlaySong, stopPlayback };
}
