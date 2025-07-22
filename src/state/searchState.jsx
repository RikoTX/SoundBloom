import { useState } from "react";

export default function useSearchState() {
  const [showAllPlaylist, setShowAllPlaylist] = useState(false);
  const [showPopularAll, setShowPopularAll] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [showAllAlbums, setShowAllAlbums] = useState(false);
  const [showNewReleaseAll, setShowNewReleaseAll] = useState(false);
  const [showAllRectangle, setShowAllRectangle] = useState(false);

  return {
    showAllPlaylist,
    setShowAllPlaylist,
    showPopularAll,
    setShowPopularAll,
    showAllVideos,
    setShowAllVideos,
    showAllAlbums,
    setShowAllAlbums,
    showNewReleaseAll,
    setShowNewReleaseAll,
    showAllRectangle,
    setShowAllRectangle,
  };
}