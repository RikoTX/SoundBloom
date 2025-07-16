import React from "react";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

const PlaylistGrid = ({ title, pinkTitle, playlist = [], showAll, setShowAll }) => {
  const playlistToShow = showAll ? playlist : playlist.slice(0, 5);

  return (
    <div>
      <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            paddingRight: "40px",
            paddingLeft: "40px",
          }}
        >
          {playlistToShow.map((playlist, index) => (
            <div
                    key={index}
                    style={{
                      textAlign: "center",
                      backgroundColor: "#1F1F1F",
                      borderRadius: "10px",
                    }}
                  >
                    <img
                      src={playlist.cover}
                      alt={playlist.titlePlaylist}
                      style={{
                        width: "170px",
                        height: "160px",
                        borderRadius: "10px",
                      }}
                    />
                    <p
                      style={{
                        margin: "5px 0",
                        fontWeight: 600,
                        display: "flex",
                        justifyContent: "flex-start",
                        padding: " 3px",
                        paddingLeft: "8px",
                      }}
                    >
                      {playlist.titlePlaylist}
                    </p>
                  </div>
          ))}

          {!showAll && playlist.length > 4 && (
            <ViewAllCircleButton onToggle={() => setShowAll(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistGrid;
