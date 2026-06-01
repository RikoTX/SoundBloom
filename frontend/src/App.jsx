import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Sider from "./components/Sider/Sider";
import Header from "./components/Header/Header";
import ContentPage from "./pages/ContentPage";
import MusicPlayer from "./components/MusicPlayer/MusicPlayer";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChooseUsername from "./pages/auth/ChooseUsername";
import ChangePassword from "./pages/auth/ChangePassword";
import useAppState from "./state/appState";
import { LibraryProvider } from "./state/libraryState";
import { getToken } from "./utils/getToken";
import { fetchMe } from "./api/authApi";
import ToastHost from "./components/ToastHost/ToastHost";

function MainShell() {
  const navigate = useNavigate();
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
    contentRef,
  } = useAppState();

  const siderWidth = isSiderOpen ? 250 : 0;
  const [isAuth, setIsAuth] = useState(() => getToken().isAuth);

  useEffect(() => {
    const syncAuth = () => {
      const authed = getToken().isAuth;
      setIsAuth(authed);
      if (!authed) {
        setCurrentTrackIndex(null);
        setCurrentPlaylist(null);
      }
    };
    syncAuth();
    window.addEventListener("soundbloom-auth-change", syncAuth);
    return () => window.removeEventListener("soundbloom-auth-change", syncAuth);
  }, [setCurrentPlaylist, setCurrentTrackIndex]);

  useEffect(() => {
    const { isAuth, token } = getToken();
    if (!isAuth || !token) return;

    fetchMe(token)
      .then((profile) => {
        if (profile.mustChangePassword) {
          navigate("/change-password", { replace: true });
        }
      })
      .catch(() => {});
  }, [navigate]);

  return (
    <div
      className="flex h-screen bg-sb-base text-sb-fg"
      style={{ display: "flex", height: "100vh" }}
    >
      <Sider isOpen={isSiderOpen} setIsOpen={setIsSiderOpen} />
      <Header
        isOpen={isSiderOpen}
        setIsOpen={setIsSiderOpen}
        setCurrentTrackIndex={setCurrentTrackIndex}
        setCurrentPlaylist={setCurrentPlaylist}
      />

      <div
        style={{
          marginLeft: siderWidth,
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.3s ease",
          paddingTop: "80px",
        }}
      >
        <div
          ref={contentRef}
          className="custom-scrollbar"
          style={{
            flex: 1,
            minWidth: 0,
            overflowX: "hidden",
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
      </div>

      {isAuth && currentTrackIndex !== null && currentPlaylist && (
        <MusicPlayer
          playlist={currentPlaylist}
          currentIndex={currentTrackIndex}
          setCurrentIndex={setCurrentTrackIndex}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <ToastHost />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/choose-username" element={<ChooseUsername />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="*" element={<MainShell />} />
      </Routes>
    </LibraryProvider>
  );
}
