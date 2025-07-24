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
      <Row gutter={[32, 24]} justify="space-between" align="middle">
        <Col xs={24} md={8}>
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
        </Col>

        <Col xs={24} md={8}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "30px",
              flexWrap: "wrap",
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

        <Col xs={24} md={8}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
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
            left: "40px",
            top: "85px",
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
