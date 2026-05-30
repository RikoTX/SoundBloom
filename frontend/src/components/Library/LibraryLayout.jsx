import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeartOutlined } from "@ant-design/icons";
import { getToken } from "../../utils/getToken";

export default function LibraryEmpty({
  icon: Icon = HeartOutlined,
  title,
  description,
  actionLabel,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuth } = getToken();

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px] px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[#EE10B0]/10 border border-[#EE10B0]/25 flex items-center justify-center mb-6">
        <Icon className="text-3xl text-[#EE10B0]" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-white/50 max-w-md mb-8">{description}</p>
      {!isAuth && (
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="px-8 py-3 rounded-xl bg-[#EE10B0] text-white font-semibold hover:bg-[#cb0094] transition-colors cursor-pointer"
        >
          {actionLabel || t("library.signInPrompt")}
        </button>
      )}
    </div>
  );
}

export function LibraryPageShell({ title, subtitle, children }) {
  return (
    <div className="px-6 sm:px-10 py-8 pb-28 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{title}</h1>
        {subtitle && <p className="text-white/50">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function countLabel(t, count, singularKey, pluralKey) {
  return count === 1
    ? t(singularKey, { count })
    : t(pluralKey, { count });
}

export { countLabel };
