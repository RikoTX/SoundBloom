import { Row, Col } from "antd";
import { motion } from "framer-motion";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";

export default function GridCircleShowAll({
  title,
  pinkTitle,
  artists = [],
  onClickArtists,
  loading = false,
  skeletonCount = 12,
}) {
  const sortedArtists =
    artists.length > 0 && artists[0].plays !== undefined
      ? [...artists].sort((a, b) => b.plays - a.plays)
      : artists;

  const showSkeletons = loading && sortedArtists.length === 0;

  return (
    <div style={{ padding: "0 40px" }}>
      <p style={{ fontWeight: 600, fontSize: 35, marginLeft: "4%" }}>
        {title} <span style={{ color: "#cb0094" }}>{pinkTitle}</span>
      </p>

      <Row gutter={[20, 20]} align="middle" justify="start">
        {showSkeletons
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <Col
                key={`skeleton-${index}`}
                xs={12}
                sm={8}
                md={6}
                lg={4}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(110deg, #1a1a1a 30%, #2a2a2a 50%, #1a1a1a 70%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 1.4s linear infinite",
                  }}
                />
                <div
                  style={{
                    marginTop: 12,
                    height: 16,
                    width: 90,
                    borderRadius: 4,
                    background: "#1a1a1a",
                  }}
                />
              </Col>
            ))
          : sortedArtists.map((artist, index) => {
              const name = artist.artist || artist.name;
              return (
                <Col
                  key={artist.id ?? index}
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
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <img
                      src={resolveMediaUrl(artist.cover)}
                      alt={name}
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        objectFit: "cover",
                        background: "#1a1a1a",
                      }}
                      loading="lazy"
                    />
                    <p style={{ marginTop: 8, fontWeight: 300, fontSize: 18 }}>
                      {name}
                    </p>
                  </motion.div>
                </Col>
              );
            })}
      </Row>
    </div>
  );
}
