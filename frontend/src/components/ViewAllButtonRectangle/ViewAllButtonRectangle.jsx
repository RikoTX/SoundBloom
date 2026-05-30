import React from "react";
import { useTranslation } from "react-i18next";

const ViewAllButtonRectangle = ({ onToggle }) => {
  const { t } = useTranslation();

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button
        type="button"
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
          {t("common.viewAll")}
        </p>
      </button>
    </div>
  );
};

export default ViewAllButtonRectangle;
