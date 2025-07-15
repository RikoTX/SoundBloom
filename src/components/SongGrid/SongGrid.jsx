import React from "react";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

const SongGrid = ({ title, songs, showAll, setShowAll, handlePlaySong, pinkTitle }) => {
  const songsToShow = showAll ? songs : songs.slice(0, 5);

  return (
    <div>
      <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            width: "85%",
            gap: "20px",
          }}
        >
          {songsToShow.map((song, index) => (
            <div
              key={index}
              onClick={() => handlePlaySong(songs, index)}
              style={{
                textAlign: "center",
                backgroundColor: "#1F1F1F",
                padding: 10,
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              <img
                src={song.cover}
                alt={song.title}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "10px",
                }}
              />
              <p style={{ margin: "5px 0", fontWeight: 600 }}>{song.title}</p>
              <p style={{ margin: 0, color: "#929292", fontSize: "12px" }}>
                {song.artist}
              </p>
            </div>
          ))}
        </div>

        {!showAll && songs.length > 5 && (
          <ViewAllCircleButton onToggle={() => setShowAll(true)} />
        )}
      </div>
    </div>
  );
};

export default SongGrid;
