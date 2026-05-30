import React, { useState, useEffect } from "react";
import {
  SearchOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { searchJamendoTracks } from "../../api/JamendoMusicApi";
import "./SearchBarWithHeader.css";

const SearchInput = ({ handlePlaySong }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = searchValue.trim();
    if (!query) {
      setTracks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const timer = setTimeout(() => {
      searchJamendoTracks(query)
        .then((list) => {
          if (!cancelled) setTracks(list || []);
        })
        .catch(() => {
          if (!cancelled) setTracks([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchValue]);

  const onPlay = (list, index) => {
    const formatted = list.map((track) => ({
      music: track.audio || track.music,
      title: track.title,
      artist: track.artist,
      cover: track.cover,
    }));
    handlePlaySong(formatted, index);
    setSearchValue("");
  };

  return (
    <div style={{ position: "relative", width: "600px" }}>
      <div
        style={{
          display: "flex",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#18181B",
          border: "1px solid #333",
        }}
      >
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={t("nav.searchPlaceholder")}
          style={{
            flex: 1,
            padding: "10px 16px",
            border: "none",
            outline: "none",
            color: "#fff",
            fontSize: "14px",
          }}
        />
        <button
          type="button"
          style={{
            padding: "8px 16px",
            background: "none",
            border: "none",
            color: "#888",
          }}
        >
          <SearchOutlined />
        </button>
      </div>

      {searchValue && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: 0,
            width: "100%",
            maxHeight: "400px",
            overflowY: "auto",
            zIndex: 9999,
            background: "#18181B",
            border: "1px solid #333",
            borderRadius: "8px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}
          className="custom-scroll"
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <LoadingOutlined style={{ fontSize: 24, color: "#cb0094" }} />
            </div>
          ) : tracks.length === 0 ? (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#888",
              }}
            >
              {t("common.noResults")}
            </div>
          ) : (
            tracks.map((track, idx) => (
              <div
                key={track.id ?? `t-${idx}`}
                onClick={() => onPlay(tracks, idx)}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  padding: "10px",
                  cursor: "pointer",
                  borderBottom: "1px solid #333",
                }}
                className="search-item-hover"
              >
                <img
                  src={track.cover}
                  alt={track.title}
                  style={{
                    width: 45,
                    height: 45,
                    objectFit: "cover",
                    borderRadius: 4,
                  }}
                />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div
                    style={{
                      fontWeight: 500,
                      color: "#fff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {track.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {track.artist}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#555",
                    marginRight: "10px",
                  }}
                >
                  {track.time}
                </div>
                <PlayCircleOutlined
                  style={{ color: "#cb0094", fontSize: 20 }}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
