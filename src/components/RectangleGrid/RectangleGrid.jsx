import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";
import { Row, Col } from "antd";

export default function RectangleGrid({
  title,
  pinkTitle,
  rectangle = [],
  showAll,
  setShowAll,
}) {
  const rectangleToShow = showAll ? rectangle : rectangle.slice(0, 4);

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
          padding: "0 40px",
        }}
      >
        <Row
          justify="space-between"
          align="align"
          gutter={[20, 20]}
          style={{ width: "100%" }}
        >
          {rectangleToShow.map((song, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <img
                src={import.meta.env.BASE_URL+song.cover}
                style={{
                  width: "240px",
                  height: "160px",
                  borderRadius: "5px",
                }}
              />
            </div>
          ))}
          {!showAll && rectangle.length > 3 && (
            <Col
              style={{
                display: "flex",
                justifyContent: "center",
                paddingLeft: "40px",
              }}
            >
              <ViewAllCircleButton onToggle={() => setShowAll(true)} />
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
}
