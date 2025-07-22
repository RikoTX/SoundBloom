import { useState, useRef } from "react";

export default function useAppState() {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedArtists, setSelectedArtists] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [isSiderOpen, setIsSiderOpen] = useState(true);
  const contentRef = useRef(null);

  return {
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
  };
}
