import { useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  redirectToRegisterForPlayback,
} from "../utils/requireAuthForPlayback";

export default function usePlayerControls(setCurrentPlaylist, setCurrentTrackIndex) {
  const navigate = useNavigate();

  const handlePlaySong = (playlist, index) => {
    if (!isAuthenticated()) {
      redirectToRegisterForPlayback(navigate);
      return;
    }

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
