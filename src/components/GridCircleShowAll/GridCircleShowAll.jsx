import { Row, Col } from "antd";

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
    <div style={{ padding: "0 40px" }}>
      <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <Row gutter={[20, 20]} align="middle" justify="start">
        {sortedArtists.map((artist, index) => (
          <Col
            key={index}
            xs={12}
            sm={8}
            md={6}
            lg={4}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              textAlign: "center",
            }}
            onClick={() => onClickArtists?.(artist)}
          >
            <img
              src={import.meta.env.BASE_URL+artist.cover}
              alt={artist.artist}
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <p style={{ marginTop: 8, fontWeight: 300, fontSize: 18 }}>
              {artist.artist}
            </p>
          </Col>
        ))}
      </Row>
    </div>
  );
}
