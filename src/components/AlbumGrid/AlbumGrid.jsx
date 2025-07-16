import React from "react";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

const AlbumGrid = ({
  title,
  pinkTitle,
  albums = [],
  showAll,
  setShowAll,
  onClickAlbum,
}) => {
  const sortedAlbums =
    albums.length > 0 && albums[0].plays !== undefined
      ? [...albums].sort((a, b) => b.plays - a.plays)
      : albums;

  const albumsToShow = showAll ? sortedAlbums : sortedAlbums.slice(0, 5);

  return (
    <div>
      <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          flexWrap: "wrap",
          padding: "0 40px",
          gap: "30px",
        }}
      >
        {albumsToShow.map((album, index) => (
          <div
            key={index}
            onClick={() => onClickAlbum?.(album)}
            style={{
              textAlign: "center",
              backgroundColor: "#1F1F1F",
              padding: 10,
              borderRadius: "10px",
              cursor: "pointer",
              width: "160px",
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ViewAllCircleButton onToggle={() => setShowAll(true)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AlbumGrid;
