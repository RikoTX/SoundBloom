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
import { Row, Col } from "antd"; 

export default function MusicPlayer({
  playlist,
  currentIndex,
  setCurrentIndex,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("playerVolume");
    return saved !== null ? parseFloat(saved) : 1;
  });
  const [isVisible, setIsVisible] = useState(true);

  const currentSong = playlist[currentIndex];

  useEffect(() => {
    if (!currentSong) return;
    if (audioRef.current) audioRef.current.pause();

    const newAudio = new Audio(currentSong.music);
    newAudio.volume = volume;
    audioRef.current = newAudio;

    newAudio.play().then(() => setIsPlaying(true)).catch(console.warn);
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
    };
    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [currentIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      setTimeout(() => {
        const nextIndex = (currentIndex + 1) % playlist.length;
        setCurrentIndex(nextIndex);
      }, 1000);
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [currentIndex]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const playNext = () => setCurrentIndex((currentIndex + 1) % playlist.length);
  const playPrevious = () =>
    setCurrentIndex((currentIndex - 1 + playlist.length) % playlist.length);
  const handleVolumeChange = (e) => setVolume(parseFloat(e.target.value));

  if (!currentSong || !isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#181818",
        color: "white",
        padding: "10px 20px 0",
        zIndex: 1100,
        borderTop: "1px solid #333",
        height: "100px",
      }}
    >
      <Row justify="space-between" align="middle" style={{ height: "60px" }}>
        <Col xs={24} sm={8}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <img
              src={import.meta.env.BASE_URL + currentSong.cover}
              alt={currentSong.title}
              style={{ width: "60px", height: "60px", borderRadius: "8px" }}
            />
            <div>
              <div style={{ fontWeight: "bold" }}>{currentSong.title}</div>
              <div style={{ fontSize: "12px", color: "#aaa" }}>
                {currentSong.artist}
              </div>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={8} style={{ textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "25px",
              fontSize: "24px",
            }}
          >
            <StepBackwardOutlined
              style={{ cursor: "pointer" }}
              onClick={playPrevious}
            />
            {isPlaying ? (
              <PauseOutlined
                style={{ cursor: "pointer" }}
                onClick={togglePlayPause}
              />
            ) : (
              <CaretRightOutlined
                style={{ cursor: "pointer" }}
                onClick={togglePlayPause}
              />
            )}
            <StepForwardOutlined
              style={{ cursor: "pointer" }}
              onClick={playNext}
            />
          </div>
        </Col>

        <Col xs={24} sm={8} style={{ textAlign: "right" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {volume === 0 ? (
              <MutedOutlined
                onClick={() => setVolume(1)}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <SoundOutlined
                onClick={() => setVolume(0)}
                style={{ cursor: "pointer" }}
              />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              style={{
                width: "100px",
                height: "4px",
                borderRadius: "2px",
                background: "#444",
                cursor: "pointer",
                accentColor: "#cb0094",
              }}
            />
            <CloseOutlined
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                }
                setIsPlaying(false);
                setIsVisible(false);
              }}
              style={{ cursor: "pointer", fontSize: "18px", color: "#ccc" }}
            />
          </div>
        </Col>
      </Row>

      <div
        style={{
          height: "4px",
          width: "100%",
          backgroundColor: "#333",
          marginTop: "10px",
          position: "relative",
          cursor: "pointer",
        }}
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
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            backgroundColor: "#cb0094",
            transition: "width 0.2s linear",
          }}
        />
      </div>
    </div>
  );
}
