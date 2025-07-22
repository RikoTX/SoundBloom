import { useState } from "react";

export default function useSearchState() {
  const [showPopularAll, setShowPopularAll] = useState(false);
  const [showPopularTableAll, setShowPopularTableAll] = useState(false);
  const [showPopularAlbumsAll, setShowPopularAlbumsAll] = useState(false);

  return {
    showPopularAll,
    setShowPopularAll,
    showPopularTableAll,
    setShowPopularTableAll,
    showPopularAlbumsAll,
    setShowPopularAlbumsAll,
  };
}