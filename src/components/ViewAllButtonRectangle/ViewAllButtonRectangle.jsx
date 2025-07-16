import React from "react";

const ViewAllButtonRectangle = ({ onToggle }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button
        onClick={onToggle}
        style={{
          backgroundColor: "#1E1E1E",
          width: "120px",
          borderRadius: "5px",
          height: "40px",
          fontSize: "30px",
          border: "none",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        +
        <p
          style={{
            marginLeft: "8px",
            fontWeight: 500,
            fontSize: "15px",
            color: "white",
          }}
        >
          View All
        </p>
      </button>
    </div>
  );
};

export default ViewAllButtonRectangle;
