import React, { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Row, Col } from "antd";

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
    <div style={{ padding: "40px", width: "90%", position: "relative" }}>
      <Row
        gutter={[60, 24]}
        align="middle"
        wrap
        style={{ flexWrap: "wrap" }}
      >
        <Col>
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
                width: "100%",
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
        </Col>

        <Col>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "30px",
            }}
          >
            {["About Us", "Contact", "Premium"].map((item) => (
              <a
                key={item}
                href="#"
                style={{
                  fontSize: "17px",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </Col>

        <Col>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
            }}
          >
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
        </Col>
      </Row>

      {searchValue && (
        <div
          style={{
            position: "absolute",
            top: "85px",
            marginLeft: '205px',
            transform: "translateX(-50%)",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
            padding: "10px",
            width: "400px",
            zIndex: 10,
            color: "white",
            maxHeight: "400px",
            overflowY: "auto",
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
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <img
                  src={song.cover}
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
            ))
          ) : (
            <p style={{ color: "#888" }}>No results found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBarWithHeader;
