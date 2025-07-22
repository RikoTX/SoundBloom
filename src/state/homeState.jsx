import { useState } from "react";

export default function useHomeState() {
  const [searchValue, setSearchValue] = useState("");
  const [showPopularAll, setShowPopularAll] = useState(false);
  const [showTrendingAll, setShowTrendingAll] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllAlbums, setShowAllAlbums] = useState(false);
  const [showAllPlaylist, setShowAllPlaylist] = useState(false);
  const [showWeeklyAll, setShowWeeklyAll] = useState(false);
  const [showNewReleaseAll, setShowNewReleaseAll] = useState(false);

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
  };
}
