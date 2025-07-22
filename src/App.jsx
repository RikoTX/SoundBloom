import { useRef, useState } from "react";
import Sider from "./components/Sider/Sider";
import ContentPage from "./pages/ContentPage";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";

export default function App() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedArtists, setSelectedArtists] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const contentRef = useRef(null);

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#181818" }}
    >
      <Sider />
      <div
        ref={contentRef}
        style={{
          flex: 1,
          overflowY: "auto",
          paddingBottom: currentTrackIndex !== null ? "120px" : "0",
          position: "relative",
        }}
      >
        <ScrollToTop scrollRef={contentRef} />
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
