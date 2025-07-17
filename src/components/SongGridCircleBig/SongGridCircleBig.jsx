import React from "react";
import ViewAllCircleButton from "../../components/ViewAllCircleButton/ViewAllCircleButton";

export default function SongGridCircleBig({
  title,
  pinkTitle,
  items = [],
  showAll,
  setShowAll,
}) {
  const itemsToShow = showAll ? items : items.slice(0, 4);
  return (
    <div>
      <p
        style={{
          fontWeight: 600,
          fontSize: 35,
          margin: "35px 10px 0px 4%",
          paddingBottom: "25px",
        }}
      >
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
        {itemsToShow.map((fan, index) => (
          <div
            key={index}
            style={{
              textAlign: "center",
              padding: 10,
              borderRadius: "10px",
            }}
          >
            <img
              src={fan.cover}
              alt={fan.artist}
              style={{
                width: "220px",
                height: "220px",
                borderRadius: "300px",
              }}
            />
            <p style={{ margin: "5px 0", fontWeight: 300, fontSize: "18px" }}>
              {fan.artist}
            </p>
          </div>
        ))}
        {!showAll && items.length > 2 && (
          <ViewAllCircleButton onToggle={() => setShowAll(true)} />
        )}
      </div>
    </div>
  );
}
