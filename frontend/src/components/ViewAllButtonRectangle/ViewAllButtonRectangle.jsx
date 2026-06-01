import React from "react";
import { useTranslation } from "react-i18next";

const ViewAllButtonRectangle = ({ onToggle }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center">
      <button
        type="button"
        onClick={onToggle}
        className="sb-view-all-btn h-10 min-w-[120px] rounded-md px-3 text-[30px]"
      >
        +
        <span className="ml-2 text-[15px] font-medium">{t("common.viewAll")}</span>
      </button>
    </div>
  );
};

export default ViewAllButtonRectangle;
