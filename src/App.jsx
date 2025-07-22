import { useRef, useState } from "react";
import Sider from "./components/Sider/Sider";
import ContentPage from "./pages/ContentPage";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import useAppState from "./state/appState";

export default function App() {
  const {
    selectedAlbum,
    setSelectedAlbum,
    selectedArtists,
    setSelectedArtists,
    currentTrackIndex,
    setCurrentTrackIndex,
    currentPlaylist,
    setCurrentPlaylist,
    isSiderOpen,
    setIsSiderOpen,
  } = useAppState();
  const contentRef = useRef(null);
  const siderWidth = isSiderOpen ? 250 : 0;

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#181818" }}
    >
      <Sider isOpen={isSiderOpen} setIsOpen={setIsSiderOpen} />

      <div
        ref={contentRef}
        style={{
          marginLeft: siderWidth,
          flex: 1,
          overflowY: "auto",
          paddingBottom: currentTrackIndex !== null ? "120px" : "0",
          position: "relative",
          transition: "margin-left 0.3s ease",
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
