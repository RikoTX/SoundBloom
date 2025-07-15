import { Routes, Route, Navigate } from "react-router-dom";
import Footer from '../components/Footer/Footer';
import Home from "./Home/Home";
import Search from "./Search/Search";
import Popular from "./Popular/Popular";
import PageAlbums from "./PageAlbums/PageAlbums";
import PageArtists from "./PageArtists/PageArtists";
import Artists from "./Artists/Artists";

export default function ContentPage({
  selectedAlbum,
  setSelectedAlbum,
  selectedArtists,
  setSelectedArtists,
  setCurrentTrackIndex,
  setCurrentPlaylist,
}) {
  return (
    <div
      style={{
        backgroundColor: "#181818",
        color: "white",
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route
          path="/Home"
          element={
            <Home
              setCurrentTrackIndex={setCurrentTrackIndex}
              setCurrentPlaylist={setCurrentPlaylist}
            />
          }
        />
        <Route
          path="/Search"
          element={
            <Search
              setCurrentTrackIndex={setCurrentTrackIndex}
              setCurrentPlaylist={setCurrentPlaylist}
            />
          }
        />
        <Route
          path="/Popular"
          element={<Popular setSelectedAlbum={setSelectedAlbum} />}
        />
        <Route
          path="/Artist"
          element={<Artists setSelectedArtists={setSelectedArtists} />}
        />
        <Route path="/LikedSongs" element={<div>Понравившиеся песни</div>} />
        <Route path="/Playlist" element={<div>Плейлист</div>} />
        <Route path="/Settings" element={<div>Настройки</div>} />
        <Route path="/Logout" element={<div>Выход</div>} />
        <Route
          path="/PageAlbums"
          element={<PageAlbums selectedAlbum={selectedAlbum} />}
        />
        <Route
          path="/PageArtists"
          element={<PageArtists selectedArtists={selectedArtists} />}
        />
        <Route
          path="*"
          element={<Home setCurrentTrackIndex={setCurrentTrackIndex} />}
        />
      </Routes>

      <Footer />
    </div>
  );
}
