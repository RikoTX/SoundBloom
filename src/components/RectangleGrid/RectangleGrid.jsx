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

      <div style={{ padding: "0 40px" }}>
        <Row gutter={[20, 20]} >
          {rectangleToShow.map((song, index) => (
            <Col key={index} xs={13} sm={9} md={7} lg={5}>
              <div
                style={{
                  textAlign: "center",
                  borderRadius: "10px",
                  marginBottom: "20px",
                }}
              >
                <img
                  src={import.meta.env.BASE_URL + song.cover}
                  style={{
                    width: "240px",
                    height: "160px",
                    borderRadius: "5px",
                  }}
                />
              </div>
            </Col>
          ))}

          {!showAll && rectangle.length > 2 && (
            <Col>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  paddingLeft: "40px",
                }}
              >
                <ViewAllCircleButton onToggle={() => setShowAll(true)} />
              </div>
            </Col>
          )}
        </Row>
      </div>
    </div>
  );
}
