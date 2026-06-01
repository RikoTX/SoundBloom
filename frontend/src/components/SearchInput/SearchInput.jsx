import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { searchAllTracks } from "../../utils/searchAllTracks";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import { formatPlaylistForPlayer } from "../../utils/formatTrackForPlayer";

const SearchInput = forwardRef(({ allSongs = [], handlePlaySong }, ref) => {
  const [searchValue, setSearchValue] = useState("");
  const [remoteTracks, setRemoteTracks] = useState([]);
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
        setRemoteTracks([]);
        return;
      }

      setLoading(true);
      const results = await searchAllTracks(searchValue, { limit: 20, platformLimit: 10 });
      setRemoteTracks(results);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handlePlayRemote = (playlist, index) => {
    handlePlaySong(formatPlaylistForPlayer(playlist), index);
  };

  useImperativeHandle(ref, () => ({
    clearSearch() {
      setSearchValue("");
      setRemoteTracks([]);
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
                    src={resolveMediaUrl(song.cover)}
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

              {remoteTracks.map((track, index) => (
                <div
                  key={`remote-${track.source}-${track.id ?? index}`}
                  onClick={() => handlePlayRemote(remoteTracks, index)}
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
                    src={track.cover || track.image || "default-cover.jpg"}
                    alt="cover"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "5px",
                      objectFit: "cover",
                    }}
                  />
                  <strong>{track.title || track.name}</strong>
                  <span style={{ marginLeft: "10px", color: "#888" }}>
                    {track.artist || track.artist_name}
                  </span>
                </div>
              ))}

              {filteredSongs.length === 0 && remoteTracks.length === 0 && (
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
