import { useEffect, useRef, useState } from "react";
import {
  CaretRightOutlined,
  PauseOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  SoundOutlined,
  CloseOutlined,
  MutedOutlined,
} from "@ant-design/icons";
import ElasticSlider from "../ElasticSlider/ElasticSlider";
import LikeButton from "../LikeButton/LikeButton";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import { getPreference, PREFS_CHANGE_EVENT } from "../../utils/userPreferences";
import { recordSoundbloomListen } from "../../utils/recordListen";

export default function MusicPlayer({
  playlist,
  currentIndex,
  setCurrentIndex,
}) {
  const audioRef = useRef(null);
  const listenRecordedRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("playerVolume");
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [isVisible, setIsVisible] = useState(true);
  const [showMobileVolume, setShowMobileVolume] = useState(false);

  const currentSong = playlist[currentIndex];
  const audioUrl = currentSong?.music || currentSong?.audio;

  useEffect(() => {
    if (!currentSong) return;
    listenRecordedRef.current = null;
    if (audioRef.current) audioRef.current.pause();

    const newAudio = new Audio(audioUrl);
    newAudio.volume = volume;
    audioRef.current = newAudio;

    newAudio
      .play()
      .then(() => setIsPlaying(true))
      .catch(console.warn);
    return () => newAudio.pause();
  }, [currentIndex]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    localStorage.setItem("playerVolume", volume.toString());
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateProgress = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
      if (
        currentSong?.source === "soundbloom" &&
        audio.currentTime >= 12 &&
        listenRecordedRef.current !== currentSong.id
      ) {
        listenRecordedRef.current = currentSong.id;
        recordSoundbloomListen(currentSong);
      }
    };
    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [currentIndex, currentSong]);

  useEffect(() => {
    const syncVolume = () => {
      const saved = localStorage.getItem("playerVolume");
      if (saved !== null) setVolume(parseFloat(saved));
    };
    window.addEventListener(PREFS_CHANGE_EVENT, syncVolume);
    return () => window.removeEventListener(PREFS_CHANGE_EVENT, syncVolume);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      const autoplay = getPreference("autoplayNext");
      const repeat = getPreference("repeatMode");
      const crossfade = getPreference("crossfadeEnabled");
      const delay = crossfade ? 1000 : 0;

      if (repeat === "one") {
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
          }
        }, delay);
        return;
      }

      if (!autoplay && repeat === "off") return;

      setTimeout(() => {
        if (repeat === "off") {
          if (currentIndex >= playlist.length - 1) return;
          setCurrentIndex(currentIndex + 1);
          return;
        }
        setCurrentIndex((currentIndex + 1) % playlist.length);
      }, delay);
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentIndex, playlist.length]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const playNext = () => setCurrentIndex((currentIndex + 1) % playlist.length);
  const playPrevious = () =>
    setCurrentIndex((currentIndex - 1 + playlist.length) % playlist.length);

  if (!currentSong || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 pb-3 right-0 bg-sb-base text-sb-fg z-[1100] border-t border-sb-border-strong px-2 sm:px-4 md:px-5 pt-2 sm:pt-2.5">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 h-[56px] sm:h-[64px] md:h-[70px]">
        {}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 basis-0">
          <img
            src={resolveMediaUrl(currentSong.cover)}
            alt={currentSong.title}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-[58px] md:h-[58px] rounded-md sm:rounded-lg object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-xs sm:text-sm md:text-base truncate">
              {currentSong.title}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400 truncate">
              {currentSong.artist}
            </div>
          </div>
        </div>

        {}
        <div className="flex items-center justify-center gap-4 sm:gap-5 md:gap-6 text-lg sm:text-xl md:text-2xl flex-shrink-0">
          <StepBackwardOutlined
            className="cursor-pointer hover:text-pink-400 transition-colors"
            onClick={playPrevious}
          />
          {isPlaying ? (
            <PauseOutlined
              className="cursor-pointer hover:text-pink-400 transition-colors text-xl sm:text-2xl md:text-[26px]"
              onClick={togglePlayPause}
            />
          ) : (
            <CaretRightOutlined
              className="cursor-pointer hover:text-pink-400 transition-colors text-xl sm:text-2xl md:text-[26px]"
              onClick={togglePlayPause}
            />
          )}
          <StepForwardOutlined
            className="cursor-pointer hover:text-pink-400 transition-colors"
            onClick={playNext}
          />
        </div>

        {}
        <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4 flex-1 basis-0 min-w-0">
          <LikeButton track={currentSong} size="md" />
          {}
          <div className="hidden lg:block">
            <ElasticSlider
              startingValue={0}
              maxValue={100}
              defaultValue={Math.round(volume * 100)}
              isStepped
              stepSize={1}
              onValueChange={(v) => setVolume(v / 100)}
              leftIcon={
                <MutedOutlined
                  onClick={() => setVolume(volume === 0 ? 1 : 0)}
                  className="cursor-pointer text-pink-400 hover:text-pink-300 transition-colors"
                />
              }
              rightIcon={
                <SoundOutlined
                  onClick={() => setVolume(volume === 0 ? 1 : 0)}
                  className="cursor-pointer text-pink-400 hover:text-pink-300 transition-colors"
                />
              }
            />
          </div>

          {}
          <div className="relative lg:hidden">
            <button
              type="button"
              aria-label="Volume"
              onClick={() => setShowMobileVolume((v) => !v)}
              className="p-1.5 sm:p-2 rounded-full text-pink-400 hover:text-pink-300 hover:bg-white/5 transition-colors text-base sm:text-lg cursor-pointer"
            >
              {volume === 0 ? <MutedOutlined /> : <SoundOutlined />}
            </button>

            {showMobileVolume && (
              <>
                <div
                  className="fixed inset-0 z-[1150]"
                  onClick={() => setShowMobileVolume(false)}
                />
                <div className="absolute bottom-full right-0 mb-3 z-[1200] bg-sb-muted border border-sb-border-strong rounded-xl px-4 py-5 shadow-[0_8px_30px_var(--sb-shadow)]">
                  <ElasticSlider
                    startingValue={0}
                    maxValue={100}
                    defaultValue={Math.round(volume * 100)}
                    isStepped
                    stepSize={1}
                    onValueChange={(v) => setVolume(v / 100)}
                    leftIcon={
                      <MutedOutlined
                        onClick={() => setVolume(volume === 0 ? 1 : 0)}
                        className="cursor-pointer text-pink-400 hover:text-pink-300 transition-colors"
                      />
                    }
                    rightIcon={
                      <SoundOutlined
                        onClick={() => setVolume(volume === 0 ? 1 : 0)}
                        className="cursor-pointer text-pink-400 hover:text-pink-300 transition-colors"
                      />
                    }
                  />
                </div>
              </>
            )}
          </div>

          <CloseOutlined
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              setIsPlaying(false);
              setIsVisible(false);
            }}
            className="cursor-pointer text-sm sm:text-base md:text-lg text-[#ccc] hover:text-white transition-colors"
          />
        </div>
      </div>

      {}
      <div
        className="h-1 w-full bg-sb-border-strong mt-1.5 sm:mt-2 md:mt-2.5 relative cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newTime =
            (clickX / rect.width) * (audioRef.current?.duration || 0);
          if (audioRef.current) {
            audioRef.current.currentTime = newTime;
          }
        }}
      >
        <div
          className="h-full bg-[#cb0094] transition-[width] duration-200 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
