import { useState } from "react";

export default function usePageArtistsState() {
  const [showPopularTableAll, setShowPopularTableAll] = useState(false);
  const [showAlbumsAll, setShowAlbumsAll] = useState(false);
  const [showPopularAll, setShowPopularAll] = useState(false);
  const [showNewReleaseAll, setShowNewReleaseAll] = useState(false);
  const [showAllPlaylist, setShowAllPlaylist] = useState(false);

  return {
    showPopularTableAll,
    setShowPopularTableAll,
    showAlbumsAll,
    setShowAlbumsAll,
    showPopularAll,
    setShowPopularAll,
    showNewReleaseAll,
    setShowNewReleaseAll,
    showAllPlaylist,
    setShowAllPlaylist,
  };
}