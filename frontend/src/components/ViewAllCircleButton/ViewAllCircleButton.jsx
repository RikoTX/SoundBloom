import React from "react";
import { useTranslation } from "react-i18next";

const ViewAllCircleButton = ({ onToggle }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-5">
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={onToggle}
          className="sb-view-all-circle flex items-center justify-center"
        >
          +
        </button>
        <p className="mt-2 text-[15px] font-medium text-sb-fg">
          {t("common.viewAll")}
        </p>
      </div>
    </div>
  );
};

export default ViewAllCircleButton;
