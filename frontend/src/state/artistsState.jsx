import { useState } from "react";

export default function useSearchState() {
  const [showPopularTableAll, setShowPopularTableAll] = useState(false);
  const [showPopularAll, setShowPopularAll] = useState(false);

  return {
    showPopularAll,
    setShowPopularAll,
    showPopularTableAll,
    setShowPopularTableAll,
  };
}