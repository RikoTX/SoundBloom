import { useState, useRef } from "react";

export default function useHomeState() {
  const [searchValue, setSearchValue] = useState("");
  const [showPopularAll, setShowPopularAll] = useState(false);
  const [showTrendingAll, setShowTrendingAll] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllAlbums, setShowAllAlbums] = useState(false);
  const [showAllPlaylist, setShowAllPlaylist] = useState(false);
  const [showWeeklyAll, setShowWeeklyAll] = useState(false);
  const [showNewReleaseAll, setShowNewReleaseAll] = useState(false);
  const loginRef = useRef(null);
  const [jamendoTracks, setJamendoTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hitSongs, setHitSongs] = useState([]);
  const [showHitMusicAll, setShowHitMusicAll] = useState(false);

  return {
    searchValue,
    setSearchValue,
    showPopularAll,
    setShowPopularAll,
    showTrendingAll,
    setShowTrendingAll,
    showAllVideos,
    setShowAllVideos,
    showAllAlbums,
    setShowAllAlbums,
    showAllPlaylist,
    setShowAllPlaylist,
    showWeeklyAll,
    setShowWeeklyAll,
    showNewReleaseAll,
    setShowNewReleaseAll,
    loginRef,
    jamendoTracks,
    setJamendoTracks,
    loading,
    setLoading,
    hitSongs,
    setHitSongs,
    showHitMusicAll,
    setShowHitMusicAll,
  };
}
