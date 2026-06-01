import { Routes, Route, Navigate } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Home from "./Home/Home";
import Search from "./Search/Search";
import Popular from "./Popular/Popular";
import PageAlbums from "./PageAlbums/PageAlbums";
import PageArtists from "./PageArtists/PageArtists";
import PagePlaylist from "./PagePlaylist/PagePlaylist";
import PageGenre from "./PageGenre/PageGenre";
import Artists from "./Artists/Artists";
import NotFound from "./NotFound/NotFound";
import About from "./marketing/About";
import Contact from "./marketing/Contact";
import Premium from "./marketing/Premium";
import TermsOfUse from "./marketing/TermsOfUse";
import LikedSongs from "./Library/LikedSongs";
import SavedAlbums from "./Library/SavedAlbums";
import SavedGenres from "./Library/SavedGenres";
import SavedPlaylists from "./Library/SavedPlaylists";
import Settings from "./Settings/Settings";
import AdminPanel from "./Admin/AdminPanel";
import MyTracks from "./ArtistStudio/MyTracks";
import OperatorPanel from "./Operator/OperatorPanel";
import RequireAuth from "../components/auth/RequireAuth";
import "../index.css";
export default function ContentPage({
  setSelectedAlbum,
  setSelectedArtists,
  setCurrentTrackIndex,
  setCurrentPlaylist,
}) {
  return (
    <div
      className="bg-sb-base text-sb-fg min-h-full"
    >
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route
          path="/Home"
          element={
            <Home
              setCurrentTrackIndex={setCurrentTrackIndex}
              setCurrentPlaylist={setCurrentPlaylist}
              setSelectedAlbum={setSelectedAlbum}
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
          element={
            <Popular
              setSelectedAlbum={setSelectedAlbum}
              setCurrentTrackIndex={setCurrentTrackIndex}
              setCurrentPlaylist={setCurrentPlaylist}
            />
          }
        />
        <Route
          path="/Artist"
          element={<Artists setSelectedArtists={setSelectedArtists} />}
        />
        <Route
          path="/LikedSongs"
          element={
            <RequireAuth>
              <LikedSongs
                setCurrentTrackIndex={setCurrentTrackIndex}
                setCurrentPlaylist={setCurrentPlaylist}
              />
            </RequireAuth>
          }
        />
        <Route
          path="/SavedAlbums"
          element={
            <RequireAuth>
              <SavedAlbums />
            </RequireAuth>
          }
        />
        <Route
          path="/SavedGenres"
          element={
            <RequireAuth>
              <SavedGenres />
            </RequireAuth>
          }
        />
        <Route
          path="/SavedPlaylists"
          element={
            <RequireAuth>
              <SavedPlaylists />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        <Route
          path="/Settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminPanel />
            </RequireAuth>
          }
        />
        <Route
          path="/MyTracks"
          element={
            <RequireAuth>
              <MyTracks
                setCurrentTrackIndex={setCurrentTrackIndex}
                setCurrentPlaylist={setCurrentPlaylist}
              />
            </RequireAuth>
          }
        />
        <Route
          path="/operator"
          element={
            <RequireAuth>
              <OperatorPanel />
            </RequireAuth>
          }
        />
        <Route path="/Logout" element={<Navigate to="/Home" replace />} />
        <Route path="/PageAlbums" element={<Navigate to="/" replace />} />
        <Route
          path="/PageAlbums/:id"
          element={
            <PageAlbums
              setCurrentTrackIndex={setCurrentTrackIndex}
              setCurrentPlaylist={setCurrentPlaylist}
            />
          }
        />
        <Route
          path="/PageArtists/:artist"
          element={
            <PageArtists
              setCurrentTrackIndex={setCurrentTrackIndex}
              setCurrentPlaylist={setCurrentPlaylist}
              setSelectedAlbum={setSelectedAlbum}
            />
          }
        />
        <Route
          path="/PagePlaylist/:id"
          element={
            <PagePlaylist
              setCurrentTrackIndex={setCurrentTrackIndex}
              setCurrentPlaylist={setCurrentPlaylist}
            />
          }
        />
        <Route
          path="/PageGenre/:tag"
          element={
            <PageGenre
              setCurrentTrackIndex={setCurrentTrackIndex}
              setCurrentPlaylist={setCurrentPlaylist}
            />
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/terms" element={<TermsOfUse />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}
