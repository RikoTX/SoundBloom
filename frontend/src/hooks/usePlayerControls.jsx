import { useNavigate } from "react-router-dom";
import {
  isAuthenticated,
  redirectToRegisterForPlayback,
} from "../utils/requireAuthForPlayback";
import { useSubscription } from "../state/subscriptionState";
import { isPlaybackActive } from "../utils/playbackSession";

export default function usePlayerControls(setCurrentPlaylist, setCurrentTrackIndex) {
  const navigate = useNavigate();
  const { runSkipGated, status } = useSubscription();

  const applyPlay = (playlist, index) => {
    setCurrentTrackIndex(null);
    setCurrentPlaylist(null);
    setTimeout(() => {
      setCurrentPlaylist(playlist);
      setCurrentTrackIndex(index);
    }, 10);
  };

  const handlePlaySong = async (playlist, index) => {
    if (!isAuthenticated()) {
      redirectToRegisterForPlayback(navigate);
      return;
    }

    const switchingWhilePlaying =
      isPlaybackActive() && !status.unlimitedSkips;

    if (switchingWhilePlaying) {
      try {
        await runSkipGated(() => applyPlay(playlist, index));
      } catch {
        /* ошибка уже показана */
      }
      return;
    }

    applyPlay(playlist, index);
  };

  const stopPlayback = () => {
    setCurrentTrackIndex(null);
    setCurrentPlaylist(null);
  };

  return { handlePlaySong, stopPlayback };
}
