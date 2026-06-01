import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getToken } from "../utils/getToken";
import { likeKey } from "../utils/formatTrackForPlayer";
import * as libraryApi from "../api/libraryApi";

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [authTick, setAuthTick] = useState(0);

  useEffect(() => {
    const onAuthChange = () => setAuthTick((n) => n + 1);
    window.addEventListener("soundbloom-auth-change", onAuthChange);
    return () => window.removeEventListener("soundbloom-auth-change", onAuthChange);
  }, []);

  const { isAuth, token } = getToken();
  const [likes, setLikes] = useState([]);
  const [savedAlbums, setSavedAlbums] = useState([]);
  const [savedGenres, setSavedGenres] = useState([]);
  const [savedPlaylists, setSavedPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  const likeSet = useMemo(
    () => new Set(likes.map((t) => likeKey(t.source, t.trackId))),
    [likes]
  );

  const albumSet = useMemo(
    () => new Set(savedAlbums.map((a) => a.albumId)),
    [savedAlbums]
  );

  const genreSet = useMemo(
    () => new Set(savedGenres.map((g) => g.tag)),
    [savedGenres]
  );

  const playlistSet = useMemo(
    () => new Set(savedPlaylists.map((p) => p.playlistId)),
    [savedPlaylists]
  );

  const refresh = useCallback(async () => {
    const { token: currentToken, isAuth: authed } = getToken();

    if (!authed || !currentToken) {
      setLikes([]);
      setSavedAlbums([]);
      setSavedGenres([]);
      setSavedPlaylists([]);
      return;
    }

    setLoading(true);
    try {
      const [likesData, albumsData, genresData, playlistsData] =
        await Promise.all([
          libraryApi.fetchLikes(),
          libraryApi.fetchSavedAlbums(),
          libraryApi.fetchSavedGenres(),
          libraryApi.fetchSavedPlaylists(),
        ]);
      setLikes(likesData);
      setSavedAlbums(albumsData);
      setSavedGenres(genresData);
      setSavedPlaylists(playlistsData);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [authTick]);

  useEffect(() => {
    if (isAuth && token) {
      refresh();
    } else {
      setLikes([]);
      setSavedAlbums([]);
      setSavedGenres([]);
      setSavedPlaylists([]);
    }
  }, [isAuth, token, refresh, authTick]);

  const isLiked = useCallback(
    (source, trackId) => {
      if (!trackId || !source) return false;
      return likeSet.has(likeKey(String(source).toLowerCase(), String(trackId)));
    },
    [likeSet],
  );

  const toggleLike = useCallback(
    async (track) => {
      const { token: currentToken } = getToken();
      if (!currentToken || !track?.id || !track?.source) return false;

      const source = String(track.source).toLowerCase();
      const trackId = String(track.id);
      const key = likeKey(source, trackId);
      const currentlyLiked = likeSet.has(key);

      if (currentlyLiked) {
        await libraryApi.removeLike(source, trackId);
        setLikes((prev) =>
          prev.filter(
            (t) =>
              !(
                String(t.source).toLowerCase() === source &&
                String(t.trackId) === trackId
              ),
          ),
        );
        return false;
      }

      const saved = await libraryApi.addLike({ ...track, source });
      setLikes((prev) => {
        const withoutDup = prev.filter(
          (t) =>
            !(
              String(t.source).toLowerCase() === source &&
              String(t.trackId) === trackId
            ),
        );
        return [saved, ...withoutDup];
      });
      return true;
    },
    [likeSet],
  );

  const isAlbumSaved = useCallback(
    (albumId) => albumSet.has(String(albumId)),
    [albumSet]
  );

  const toggleAlbum = useCallback(
    async (album) => {
      const { token: currentToken } = getToken();
      if (!currentToken || !album?.id) return false;
      const id = String(album.id);

      if (albumSet.has(id)) {
        await libraryApi.removeSavedAlbum(id);
        setSavedAlbums((prev) => prev.filter((a) => a.albumId !== id));
        return false;
      }

      const saved = await libraryApi.saveAlbum(album);
      setSavedAlbums((prev) => [saved, ...prev]);
      return true;
    },
    [albumSet]
  );

  const isGenreSaved = useCallback(
    (tag) => genreSet.has(tag),
    [genreSet]
  );

  const toggleGenre = useCallback(
    async (genre) => {
      const { token: currentToken } = getToken();
      if (!currentToken || !genre?.tag) return false;

      if (genreSet.has(genre.tag)) {
        await libraryApi.removeSavedGenre(genre.tag);
        setSavedGenres((prev) => prev.filter((g) => g.tag !== genre.tag));
        return false;
      }

      const saved = await libraryApi.saveGenre(genre);
      setSavedGenres((prev) => [saved, ...prev]);
      return true;
    },
    [genreSet]
  );

  const isPlaylistSaved = useCallback(
    (playlistId) => playlistSet.has(String(playlistId)),
    [playlistSet]
  );

  const togglePlaylist = useCallback(
    async (playlist) => {
      const { token: currentToken } = getToken();
      if (!currentToken || !playlist?.id) return false;
      const id = String(playlist.id);

      if (playlistSet.has(id)) {
        await libraryApi.removeSavedPlaylist(id);
        setSavedPlaylists((prev) => prev.filter((p) => p.playlistId !== id));
        return false;
      }

      const saved = await libraryApi.savePlaylist(playlist);
      setSavedPlaylists((prev) => [saved, ...prev]);
      return true;
    },
    [playlistSet]
  );

  const value = useMemo(
    () => ({
      loading,
      likes,
      savedAlbums,
      savedGenres,
      savedPlaylists,
      refresh,
      isLiked,
      toggleLike,
      isAlbumSaved,
      toggleAlbum,
      isGenreSaved,
      toggleGenre,
      isPlaylistSaved,
      togglePlaylist,
    }),
    [
      loading,
      likes,
      savedAlbums,
      savedGenres,
      savedPlaylists,
      refresh,
      isLiked,
      toggleLike,
      isAlbumSaved,
      toggleAlbum,
      isGenreSaved,
      toggleGenre,
      isPlaylistSaved,
      togglePlaylist,
    ]
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error("useLibrary must be used within LibraryProvider");
  }
  return ctx;
}
