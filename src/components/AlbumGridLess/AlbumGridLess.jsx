import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

export default function AlbumGridLess({
  title,
  pinkTitle,
  albums = [],
  showAll,
  setShowAll,
  onClickAlbum,
}) {
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
          justifyContent: "space-between",
          flexWrap: "wrap",
          paddingRight: "40px",
          paddingLeft: "40px",
        }}
      >
        {albumsToShow.map((album, index) => (
          <div
            key={index}
            onClick={() => onClickAlbum?.(album)}
            style={{
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
              {album.year}
            </p>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <ViewAllCircleButton onToggle={() => setShowAll(true)} />
        </div>
      </div>
    </div>
  );
}
