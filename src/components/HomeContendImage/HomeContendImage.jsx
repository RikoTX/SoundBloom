import React from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Row, Col } from "antd";

const HeroSection = ({
  searchValue,
  setSearchValue,
  handleSearch,
  filteredSongs,
  handlePlaySong,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        paddingTop: "40px",
      }}
    >
      <div style={{ position: "relative", maxWidth: "100%" }}>
        <img
          src="fon.png"
          alt="SoundBloom"
          style={{
            paddingRight: "50px",
            maxWidth: "100%",
            width: "1170px",
            height: "auto",
            display: "block",
          }}
        />

        <Row style={{ position: "absolute", top: "4%", right: "5%" }} gutter={16}>
          <Col>
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
          </Col>
          <Col>
            <button
              style={{
                backgroundColor: "#cb0094",
                padding: "11px",
                width: "150px",
                borderRadius: "3px",
                border: "1px solid #cb0094",
                cursor: "pointer",
              }}
            >
              Sign Up
            </button>
          </Col>
        </Row>

        <Row
          style={{
            position: "absolute",
            top: "2.5%",
            right: "38%",
            marginTop: "20px",
          }}
          gutter={30}
        >
          {["About Us", "Contact", "Premium"].map((item) => (
            <Col key={item}>
              <a
                href="#"
                style={{
                  fontSize: "17px",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                {item}
              </a>
            </Col>
          ))}
        </Row>

        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "20%",
            transform: "translate(-50%, -50%)",
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
            onClick={handleSearch}
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

        {searchValue && (
          <div
            style={{
              position: "absolute",
              top: "80px",
              left: "20%",
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
                    src={import.meta.env.BASE_URL + song.cover}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "5px",
                    }}
                    alt="cover"
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

        <Row
          style={{
            position: "absolute",
            top: "20%",
            left: "3%",
            width: "500px",
          }}
          gutter={[0, 24]}
        >
          <Col span={24}>
            <p style={{ fontWeight: 700, fontSize: 40 }}>
              All the <span style={{ color: "#cb0094" }}>Best Songs</span>
              <br />
              in One Place
            </p>
          </Col>
          <Col span={24}>
            <p style={{ color: "#bdbdbd" }}>
              On our website, you can access an amazing collection of popular
              and new songs. Stream your favorite tracks in high quality and
              enjoy without interruptions. Whatever your taste in music, we have
              it all for you!
            </p>
          </Col>
          <Col span={8}>
            <button
              style={{
                color: "white",
                backgroundColor: "#cb0094",
                border: "1px solid #cb0094",
                padding: "10px",
                width: "150px",
                borderRadius: "4px",
                fontSize: "17px",
                cursor: "pointer",
              }}
            >
              Discover Now
            </button>
          </Col>
          <Col span={12}>
            <button
              style={{
                color: "#0E9EEF",
                backgroundColor: "transparent",
                border: "2px solid #0E9EEF",
                padding: "10px",
                width: "150px",
                borderRadius: "4px",
                fontSize: "17px",
                cursor: "pointer",
              }}
            >
              Create Playlist
            </button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default HeroSection;
