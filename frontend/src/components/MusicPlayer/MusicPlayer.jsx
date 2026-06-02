import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CaretRightOutlined,
  PauseOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
  SoundOutlined,
  CloseOutlined,
  MutedOutlined,
  DownloadOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import ElasticSlider from "../ElasticSlider/ElasticSlider";
import LikeButton from "../LikeButton/LikeButton";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import { getPreference, PREFS_CHANGE_EVENT } from "../../utils/userPreferences";
import { recordSoundbloomListen } from "../../utils/recordListen";
import { fetchTrackDownload } from "../../api/subscriptionApi";
import { useSubscription } from "../../state/subscriptionState";
import { setPlaybackActive } from "../../utils/playbackSession";
import { notifyError } from "../../utils/appNotification";

export default function MusicPlayer({
  playlist,
  currentIndex,
  setCurrentIndex,
}) {
  const audioRef = useRef(null);
  const adAudioRef = useRef(null);
  const listenRecordedRef = useRef(null);
  const playNextRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [adSecondsLeft, setAdSecondsLeft] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("playerVolume");
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [isVisible, setIsVisible] = useState(true);
  const [showMobileVolume, setShowMobileVolume] = useState(false);
  const [skipBusy, setSkipBusy] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { status, runSkipGated, playerAd, finishPlayerAd } = useSubscription();

  const currentSong = playlist[currentIndex];
  const audioUrl = currentSong?.music || currentSong?.audio;
  const adActive = Boolean(playerAd);
  const adDuration = playerAd?.durationSeconds ?? 30;

  useEffect(() => {
    setPlaybackActive(isVisible && Boolean(currentSong) && !adActive);
    return () => setPlaybackActive(false);
  }, [isVisible, currentSong, adActive]);

  useEffect(() => {
    if (adActive) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setProgress(0);
      setAdSecondsLeft(adDuration);

      if (playerAd?.playMusic && playerAd?.musicUrl) {
        const adAudio = new Audio(resolveMediaUrl(playerAd.musicUrl));
        adAudio.volume = volume * 0.4;
        adAudioRef.current = adAudio;
        adAudio.play().catch(() => {});
      }

      return () => {
        adAudioRef.current?.pause();
        adAudioRef.current = null;
      };
    }

    if (!currentSong) return undefined;

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
  }, [currentIndex, adActive]);

  useEffect(() => {
    if (!adActive) return undefined;

    setAdSecondsLeft(adDuration);
    let remaining = adDuration;

    const timer = setInterval(() => {
      remaining -= 1;
      setAdSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        finishPlayerAd();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [adActive, adDuration, finishPlayerAd]);

  useEffect(() => {
    if (audioRef.current && !adActive) audioRef.current.volume = volume;
    localStorage.setItem("playerVolume", volume.toString());
  }, [volume, adActive]);

  useEffect(() => {
    if (adActive) return undefined;

    const audio = audioRef.current;
    if (!audio) return undefined;

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
  }, [currentIndex, currentSong, adActive]);

  useEffect(() => {
    const syncVolume = () => {
      const saved = localStorage.getItem("playerVolume");
      if (saved !== null) setVolume(parseFloat(saved));
    };
    window.addEventListener(PREFS_CHANGE_EVENT, syncVolume);
    return () => window.removeEventListener(PREFS_CHANGE_EVENT, syncVolume);
  }, []);

  const advanceTrack = () => {
    if (currentIndex >= playlist.length - 1) {
      const repeat = getPreference("repeatMode");
      if (repeat === "off") return;
    }
    setCurrentIndex((currentIndex + 1) % playlist.length);
  };

  const playNext = async () => {
    if (skipBusy || adActive) return;

    setSkipBusy(true);
    try {
      await runSkipGated(advanceTrack);
    } catch {
      /* уведомление в runSkipGated */
    } finally {
      setSkipBusy(false);
    }
  };

  playNextRef.current = playNext;

  useEffect(() => {
    if (adActive) return undefined;

    const audio = audioRef.current;
    if (!audio) return undefined;

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
        playNextRef.current?.();
      }, delay);
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentIndex, playlist.length, adActive]);

  const togglePlayPause = () => {
    if (adActive || !audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const playPrevious = () => {
    if (adActive) return;
    setCurrentIndex((currentIndex - 1 + playlist.length) % playlist.length);
  };

  const handleDownload = async () => {
    if (!status.canDownload) {
      navigate("/premium");
      return;
    }

    if (currentSong?.source !== "soundbloom" || !currentSong?.id) {
      notifyError(t("subscription.download.onlyPlatform"));
      return;
    }

    try {
      const data = await fetchTrackDownload(currentSong.id);
      const link = document.createElement("a");
      link.href = resolveMediaUrl(data.downloadUrl);
      link.download = `${data.title || "track"}.${data.format || "mp3"}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    } catch (err) {
      notifyError(
        err instanceof Error ? err.message : t("subscription.download.failed"),
      );
    }
  };

  if (!currentSong || !isVisible) return null;

  const showSkipCounter = !status.unlimitedSkips && !adActive;
  const adProgress =
    adDuration > 0 ? (adDuration - adSecondsLeft) / adDuration : 0;

  return (
    <div className="fixed bottom-0 left-0 pb-3 right-0 bg-sb-base text-sb-fg z-[1100] border-t border-sb-border-strong px-2 sm:px-4 md:px-5 pt-2 sm:pt-2.5">
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 h-[56px] sm:h-[64px] md:h-[70px]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 basis-0">
          {adActive ? (
            <button
              type="button"
              onClick={() => navigate("/premium")}
              className="flex h-10 w-10 sm:h-12 sm:w-12 md:h-[58px] md:w-[58px] shrink-0 items-center justify-center rounded-md sm:rounded-lg border border-[#cb0094]/50 bg-gradient-to-br from-[#cb0094]/25 to-black/60 cursor-pointer transition hover:border-[#EE10B0]"
              title={t("subscription.ad.goPremium")}
            >
              <CrownOutlined className="text-xl sm:text-2xl md:text-3xl text-[#EE10B0]" />
            </button>
          ) : (
            <img
              src={resolveMediaUrl(currentSong.cover)}
              alt={currentSong.title}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-[58px] md:h-[58px] rounded-md sm:rounded-lg object-cover flex-shrink-0"
            />
          )}

          <div className="min-w-0 flex-1">
            {adActive ? (
              <>
                <div className="text-[10px] uppercase tracking-wider text-[#EE10B0]/90">
                  {t("subscription.ad.label")}
                </div>
                <div className="font-bold text-xs sm:text-sm md:text-base truncate text-white">
                  {playerAd.title}
                </div>
                <div className="text-[10px] sm:text-xs text-white/45 line-clamp-2 leading-snug">
                  {playerAd.body}
                </div>
                <div className="text-[10px] text-white/50 mt-0.5">
                  {t("subscription.ad.wait", { seconds: adSecondsLeft })}
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-xs sm:text-sm md:text-base truncate">
                  {currentSong.title}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 truncate">
                  {currentSong.artist}
                </div>
                {showSkipCounter && (
                  <div className="text-[10px] text-[#EE10B0]/80 mt-0.5">
                    {t("subscription.skips.remaining")}: {status.skipsRemaining}/
                    {status.skipsLimit}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-5 md:gap-6 text-lg sm:text-xl md:text-2xl flex-shrink-0">
          <StepBackwardOutlined
            className={`transition-colors ${adActive ? "opacity-30 pointer-events-none" : "cursor-pointer hover:text-pink-400"}`}
            onClick={playPrevious}
          />
          {adActive ? (
            <PauseOutlined className="text-xl sm:text-2xl md:text-[26px] text-white/25 cursor-not-allowed" />
          ) : isPlaying ? (
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
            className={`transition-colors ${
              skipBusy || adActive
                ? "opacity-40 pointer-events-none"
                : "cursor-pointer hover:text-pink-400"
            }`}
            onClick={() => playNext()}
          />
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3 md:gap-4 flex-1 basis-0 min-w-0">
          {!adActive && <LikeButton track={currentSong} size="md" />}
          {!adActive && status.canDownload && currentSong?.source === "soundbloom" && (
            <button
              type="button"
              title={t("subscription.download.button")}
              onClick={handleDownload}
              className="hidden sm:flex p-1.5 text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"
            >
              <DownloadOutlined className="text-lg" />
            </button>
          )}
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
                  className={`transition-colors ${adActive ? "opacity-30" : "cursor-pointer text-pink-400 hover:text-pink-300"}`}
                />
              }
              rightIcon={
                <SoundOutlined
                  onClick={() => setVolume(volume === 0 ? 1 : 0)}
                  className={`transition-colors ${adActive ? "opacity-30" : "cursor-pointer text-pink-400 hover:text-pink-300"}`}
                />
              }
            />
          </div>

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
                    leftIcon={<MutedOutlined />}
                    rightIcon={<SoundOutlined />}
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
              adAudioRef.current?.pause();
              setIsPlaying(false);
              setIsVisible(false);
              setPlaybackActive(false);
            }}
            className="cursor-pointer text-sm sm:text-base md:text-lg text-[#ccc] hover:text-white transition-colors"
          />
        </div>
      </div>

      <div
        className={`h-1 w-full bg-sb-border-strong mt-1.5 sm:mt-2 md:mt-2.5 relative ${adActive ? "" : "cursor-pointer"}`}
        onClick={(e) => {
          if (adActive || !audioRef.current) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const newTime =
            (clickX / rect.width) * (audioRef.current?.duration || 0);
          audioRef.current.currentTime = newTime;
        }}
      >
        <div
          className="h-full bg-[#cb0094] transition-[width] duration-200 ease-linear"
          style={{
            width: `${(adActive ? adProgress : progress) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
