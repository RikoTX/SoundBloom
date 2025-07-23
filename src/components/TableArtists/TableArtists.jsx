import React from "react";
import { HeartOutlined } from "@ant-design/icons";
import ViewAllButtonRectangle from "../../components/ViewAllButtonRectangle/ViewAllButtonRectangle";

const TableArtists = ({
  title,
  pinkTitle,
  songs = [],
  columns = [],
  showAll,
  setShowAll,
}) => {
  const sortedSongs =
    songs.length > 0 && songs[0].plays !== undefined
      ? [...songs].sort((a, b) => b.plays - a.plays)
      : songs;

  const itemsToShow = showAll ? sortedSongs : sortedSongs.slice(0, 8);

  return (
    <div>
      <p style={{ fontWeight: 600, fontSize: 35, margin: "35px 10px 0px 4%" }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <div style={{ marginLeft: "490px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "90%",
            gap: "130px",
          }}
        >
          {columns.map((col, idx) => (
            <div
              key={idx}
              style={{
                width: col.width || "150px",
                textAlign: "center",
                fontWeight: 500,
                fontSize: 20,
              }}
            >
              {col.header}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            paddingRight: "2%",
            width: "90%",
          }}
        >
          {itemsToShow.map((song, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                margin: "10px 0",
              }}
            >
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 500,
                  width: "50px",
                  textAlign: "center",
                }}
              >
                #{index + 1}
              </div>

              <div
                style={{
                  flex: 1,
                  backgroundColor: "#1F1F1F",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "60px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "25%",
                  }}
                >
                  <img
                    src={import.meta.env.BASE_URL+song.cover}
                    alt={song.title}
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "10px",
                    }}
                  />
                  <div style={{ marginLeft: "10px" }}>
                    <p
                      style={{
                        margin: "5px 0",
                        fontWeight: 600,
                        fontSize: "120%",
                      }}
                    >
                      {song.artist}
                    </p>
                  </div>
                </div>

                {columns.map((col, i) => (
                  <div
                    key={i}
                    style={{
                      width: col.width || "150px",
                      textAlign: "center",
                      fontWeight: 400,
                      fontSize: "14px",
                    }}
                  >
                    {typeof col.render === "function"
                      ? col.render(song, index)
                      : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!showAll && songs.length > 4 && (
        <ViewAllButtonRectangle onToggle={() => setShowAll(true)} />
      )}
    </div>
  );
};

export default TableArtists;
