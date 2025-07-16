import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

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
              src={song.cover}
              style={{
                width: "240px",
                height: "160px",
                borderRadius: "5px",
              }}
            />
          </div>
        ))}
        {!showAll && rectangle.length > 3 && (
          <ViewAllCircleButton onToggle={() => setShowAll(true)} />
        )}
      </div>
    </div>
  );
}
