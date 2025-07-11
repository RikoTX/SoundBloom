import { useState } from 'react';
import Sider from './components/Sider/Sider';
import ContentPage from './components/Content/ContentPage';
import MusicPlayer from './components/MusicPlayer/MusicPlayer';
import musicData from '../public/music.json';

const outerLayoutStyle = {
  height: '100vh',
  display: 'flex',
  paddingBottom: '80px',
};

export default function App() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedArtists, setSelectedArtists] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);

  return (
    <>
      <div style={outerLayoutStyle}>
        <Sider />
        <ContentPage
          selectedAlbum={selectedAlbum}
          setSelectedAlbum={setSelectedAlbum}
          selectedArtists={selectedArtists}
          setSelectedArtists={setSelectedArtists}
          currentTrackIndex={currentTrackIndex}
          setCurrentTrackIndex={setCurrentTrackIndex}
          setCurrentPlaylist={setCurrentPlaylist}
        />

      </div>

      {currentTrackIndex !== null && currentPlaylist && (
        <MusicPlayer
          playlist={currentPlaylist}
          currentIndex={currentTrackIndex}
          setCurrentIndex={setCurrentTrackIndex}
        />
      )}

    </>
  );
}
