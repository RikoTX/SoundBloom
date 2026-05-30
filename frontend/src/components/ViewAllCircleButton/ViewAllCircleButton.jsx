import React from "react";
import { useTranslation } from "react-i18next";

const ViewAllCircleButton = ({ onToggle }) => {
  const { t } = useTranslation();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <button
          onClick={onToggle}
          style={{
            backgroundColor: "#1E1E1E",
            width: "70px",
            height: "70px",
            fontSize: "30px",
            borderRadius: "50%",
            border: "none",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          +
        </button>
        <p
          style={{
            marginTop: "8px",
            fontWeight: 500,
            fontSize: "15px",
            color: "white",
          }}
        >
          {t("common.viewAll")}
        </p>
      </div>
    </div>
  );
};

export default ViewAllCircleButton;
