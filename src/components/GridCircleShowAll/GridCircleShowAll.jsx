export default function GridCircleShowAll({
  title,
  pinkTitle,
  artists = [],
  onClickArtists,
}) {
  const sortedArtists =
    artists.length > 0 && artists[0].plays !== undefined
      ? [...artists].sort((a, b) => b.plays - a.plays)
      : artists;

      
  return (
    <div>
      <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          paddingRight: "40px",
          paddingLeft: "40px",
        }}
      >
       {sortedArtists.map((artist, index) => (
            <div
              key={index}
              onClick={() =>  onClickArtists?.(artist)}
              style={{
                textAlign: "center",
                padding: 10,
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              <img
                src={artist.cover}
                alt={artist.artist}
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "70px",
                }}
              />
              <p
                style={{
                  margin: "5px 0",
                  fontWeight: 300,
                  fontSize: "18px",
                }}
              >
                {artist.artist}
              </p>
            </div>
          ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        ></div>
      </div>
    </div>
  );
}
