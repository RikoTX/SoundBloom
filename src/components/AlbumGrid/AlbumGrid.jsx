import React from "react";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

const AlbumGrid = ({ title, pinkTitle, albums = [], showAll, setShowAll }) => {
  const albumsToShow = showAll ? albums : albums.slice(0, 5);

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
          {albumsToShow.map((album, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                backgroundColor: "#1F1F1F",
                padding: 10,
                borderRadius: "10px",
              }}
            >
              <img
                src={album.cover}
                alt={album.title}
                style={{
                  width: "150px",
                  height: "150px",
                  borderRadius: "10px",
                }}
              />
              <p style={{ margin: "5px 0", fontWeight: 600 }}>{album.title}</p>
              <p style={{ margin: 0, color: "#929292", fontSize: "12px" }}>
                {album.artist}
              </p>
            </div>
          ))}

          {!showAll && albums.length > 5 && (
            <ViewAllCircleButton onToggle={() => setShowAll(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumGrid;
