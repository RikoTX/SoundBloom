import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { searchJamendoTracks } from "../../api/JamendoMusicApi";

const SearchInput = forwardRef(({ allSongs = [], handlePlaySong }, ref) => {
  const [searchValue, setSearchValue] = useState("");
  const [jamendoTracks, setJamendoTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  const filteredSongs = allSongs.filter((song) => {
    const query = searchValue.toLowerCase();
    return (
      song.title?.toLowerCase().includes(query) ||
      song.artist?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!searchValue.trim()) {
        setJamendoTracks([]);
        return;
      }

      setLoading(true);
      const results = await searchJamendoTracks(searchValue);
      setJamendoTracks(results);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handlePlayJamendoSong = (playlist, index) => {
    const formattedPlaylist = playlist.map((track) => ({
      music: track.audio,
      title: track.name,
      artist: track.artist_name,
      cover: track.image || "default-cover.jpg",
    }));
    handlePlaySong(formattedPlaylist, index);
  };

  useImperativeHandle(ref, () => ({
    clearSearch() {
      setSearchValue("");
      setJamendoTracks([]);
    },
  }));

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div
        style={{
          display: "flex",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#121212",
          border: "1px solid #333",
          width: "100%",
        }}
      >
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search For Musics, Artist, ..."
          style={{
            flex: 1,
            padding: "10px 16px",
            border: "none",
            fontSize: "14px",
            outline: "none",
            backgroundColor: "#121212",
            color: "grey",
          }}
        />
        <button
          style={{
            padding: "8px 16px",
            border: "none",
            backgroundColor: "#121212",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <SearchOutlined />
        </button>
      </div>

      {(searchValue || loading) && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "10px",
            width: "100%",
            zIndex: 10,
            color: "white",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          {loading ? (
            <LoadingOutlined
              style={{
                fontSize: 27,
                display: "flex",
                justifyContent: "center",
              }}
            />
          ) : (
            <>
              {filteredSongs.map((song, index) => (
                <div
                  key={`local-${index}`}
                  onClick={() => handlePlaySong(filteredSongs, index)}
                  style={{
                    padding: "5px 0",
                    borderBottom: "1px solid #333",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={import.meta.env.BASE_URL + song.cover}
                    alt="cover"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "5px",
                    }}
                  />
                  <strong>{song.title}</strong>
                  {song.artist && (
                    <span style={{ marginLeft: "10px", color: "#888" }}>
                      by {song.artist}
                    </span>
                  )}
                </div>
              ))}

              {jamendoTracks.map((track, index) => (
                <div
                  key={`jamendo-${index}`}
                  onClick={() => handlePlayJamendoSong(jamendoTracks, index)}
                  style={{
                    padding: "5px 0",
                    borderBottom: "1px solid #333",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                  }}
                >
                  <img
                    src={track.image || "default-cover.jpg"}
                    alt="cover"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "5px",
                    }}
                  />
                  <strong>{track.name}</strong>
                  <span style={{ marginLeft: "10px", color: "#888" }}>
                    by {track.artist_name}
                  </span>
                </div>
              ))}

              {filteredSongs.length === 0 && jamendoTracks.length === 0 && (
                <p style={{ color: "#888" }}>No results found.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default SearchInput;
