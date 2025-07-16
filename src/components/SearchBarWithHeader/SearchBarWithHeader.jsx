import React, { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";

const SearchBarWithHeader = ({ allSongs = [], handlePlaySong }) => {
  const [searchValue, setSearchValue] = useState("");

  const filteredSongs = allSongs.filter((song) => {
    const query = searchValue.toLowerCase();
    return (
      song.title?.toLowerCase().includes(query) ||
      song.artist?.toLowerCase().includes(query)
    );
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "start",
        justifyContent: "center",
        gap: "50px",
        paddingTop: "40px",
        width: "100%",
        position: "relative",
        flexWrap: "wrap",
      }}
    >
      {/* Search */}
      <div
        style={{
          display: "flex",
          borderRadius: "8px",
          overflow: "hidden",
          width: "400px",
          backgroundColor: "#121212",
          border: "1px solid #333",
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
            border: "1px solid #121212",
            backgroundColor: "#121212",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          <SearchOutlined />
        </button>
      </div>

      {/* Search Results */}
      {searchValue && (
        <div
          style={{
            position: "absolute",
            top: "80px",
            left: "22.5%",
            transform: "translateX(-50%)",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "10px",
            width: "400px",
            zIndex: 10,
            color: "white",
            cursor: "pointer",
            maxHeight: "400px",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song, index) => (
              <div
                key={index}
                onClick={() => handlePlaySong(filteredSongs, index)}
                style={{
                  padding: "5px 0",
                  borderBottom: "1px solid #333",
                  display: "flex",
                  justifyContent: "start",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <img
                  src={song.cover}
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
            ))
          ) : (
            <p style={{ color: "#888" }}>No results found.</p>
          )}
        </div>
      )}

      {/* Links */}
      <div style={{ display: "flex", justifyContent: "center", gap: "30px" }}>
        <a
          href="#"
          style={{ fontSize: "17px", color: "white", textDecoration: "none" }}
        >
          About Us
        </a>
        <a
          href="#"
          style={{ fontSize: "17px", color: "white", textDecoration: "none" }}
        >
          Contact
        </a>
        <a
          href="#"
          style={{ fontSize: "17px", color: "white", textDecoration: "none" }}
        >
          Premium
        </a>
      </div>

      {/* Auth Buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <button
          style={{
            backgroundColor: "transparent",
            color: "#cb0094",
            padding: "11px",
            width: "150px",
            border: "1px solid #cb0094",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
        <button
          style={{
            backgroundColor: "#cb0094",
            color: "white",
            padding: "11px",
            width: "150px",
            borderRadius: "3px",
            border: "1px solid #cb0094",
            cursor: "pointer",
          }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default SearchBarWithHeader;
