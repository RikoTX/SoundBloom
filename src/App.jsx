import { useState } from "react";
import Sider from "./components/Sider/Sider";
import ContentPage from "./pages/ContentPage";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";

export default function App() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedArtists, setSelectedArtists] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#181818" }}
    >
      <Sider />
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: currentTrackIndex !== null ? "120px" : "0",
          position: "relative",
        }}
      >
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
    </div>
  );
}
