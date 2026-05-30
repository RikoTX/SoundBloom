import { useState } from "react";

export default function usePopularState() {
  const [showPopularAll, setShowPopularAll] = useState(false);
  const [showPopularAlbumsAll, setShowPopularAlbumsAll] = useState(false);
  const [showPopularMusicAll, setShowPopularMusicAll] = useState(false);

  return {
    showPopularAll,
    setShowPopularAll,
    showPopularAlbumsAll,
    setShowPopularAlbumsAll,
    showPopularMusicAll,
    setShowPopularMusicAll,
  };
}
