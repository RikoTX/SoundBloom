import { useEffect, useRef, useState } from 'react';
import {
    CaretRightOutlined,
    PauseOutlined,
    StepBackwardOutlined,
    StepForwardOutlined,
    SoundOutlined,
    CloseOutlined
} from '@ant-design/icons';

export default function MusicPlayer({ playlist, currentIndex, setCurrentIndex }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isVisible, setIsVisible] = useState(true);

    const currentSong = playlist[currentIndex];

    useEffect(() => {
        if (!currentSong) return;

        if (audioRef.current) {
            audioRef.current.pause();
        }

        const newAudio = new Audio(currentSong.music);
        audioRef.current = newAudio;

        const playPromise = newAudio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setIsPlaying(true);
                })
                .catch((error) => {
                    console.warn('музыка остановилась:', error);
                });
        }

        return () => {
            newAudio.pause();
        };
    }, [currentIndex]);


    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const togglePlayPause = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const playNext = () => {
        const nextIndex = (currentIndex + 1) % playlist.length;
        setCurrentIndex(nextIndex);
    };

    const playPrevious = () => {
        const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        setCurrentIndex(prevIndex);
    };

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
    };

    if (!currentSong || !isVisible) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#181818',
                color: 'white',
                padding: '10px 20px 0',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 999,
                borderTop: '1px solid #333',
                height: '100px',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <img
                        src={currentSong.cover}
                        alt={currentSong.title}
                        style={{ width: '60px', height: '60px', borderRadius: '8px' }}
                    />
                    <div>
                        <div style={{ fontWeight: 'bold' }}>{currentSong.title}</div>
                        <div style={{ fontSize: '12px', color: '#aaa' }}>{currentSong.artist}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '25px', fontSize: '24px', alignItems: 'center' }}>
                    <StepBackwardOutlined style={{ cursor: 'pointer' }} onClick={playPrevious} />
                    {isPlaying ? (
                        <PauseOutlined style={{ cursor: 'pointer' }} onClick={togglePlayPause} />
                    ) : (
                        <CaretRightOutlined style={{ cursor: 'pointer' }} onClick={togglePlayPause} />
                    )}
                    <StepForwardOutlined style={{ cursor: 'pointer' }} onClick={playNext} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SoundOutlined />
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        style={{ width: '100px' }}
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
                        style={{ cursor: 'pointer', fontSize: '18px', color: '#ccc' }}
                    />
                </div>
            </div>

            <div style={{ height: '4px', width: '100%', backgroundColor: '#333', marginTop: '10px' }}>
                <div
                    style={{
                        height: '100%',
                        width: `${progress * 100}%`,
                        backgroundColor: '#cb0094',
                        transition: 'width 0.3s',
                    }}
                />
            </div>
        </div>
    );
}
