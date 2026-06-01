import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SearchOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./index.css";
import { Row, Col } from "antd";
import { getToken } from "../../utils/getToken";
import { clearAuthSession, PROFILE_CHANGE_EVENT } from "../../utils/authSession";
import { fetchMe } from "../../api/authApi";
import SearchBarWithHeader from "../SearchBarWithHeader/SearchBarWithHeader";
import usePlayerControls from "../../hooks/usePlayerControls";
import DiaTextReveal from "../DiaTextReveal/DiaTextReveal";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { AnimatedThemeToggler } from "../ui/animated-theme-toggler";
import { getPreference, PREFS_CHANGE_EVENT } from "../../utils/userPreferences";

export default function Header({
  isOpen,
  setIsOpen,
  setCurrentPlaylist,
  setCurrentTrackIndex,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [index, setIndex] = useState(0);
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOperator, setIsOperator] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showHeaderNews, setShowHeaderNews] = useState(
    () => getPreference("showHeaderNews") !== false,
  );
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex,
  );
  useEffect(() => {
    const loadAuth = () => {
      const { isAuth, username, isAdmin: admin, isOperator: operator, token } = getToken();
      setToken(isAuth);
      setIsAdmin(admin);
      setIsOperator(operator);
      if (username) setUsername(username);
      if (!isAuth || !token) {
        setAvatarUrl(null);
        return;
      }
      fetchMe(token)
        .then((profile) => setAvatarUrl(profile.avatarUrl || null))
        .catch(() => setAvatarUrl(null));
    };

    loadAuth();
    window.addEventListener("soundbloom-auth-change", loadAuth);
    window.addEventListener(PROFILE_CHANGE_EVENT, loadAuth);
    return () => {
      window.removeEventListener("soundbloom-auth-change", loadAuth);
      window.removeEventListener(PROFILE_CHANGE_EVENT, loadAuth);
    };
  }, []);

  useEffect(() => {
    const onPrefsChange = () =>
      setShowHeaderNews(getPreference("showHeaderNews") !== false);
    window.addEventListener(PREFS_CHANGE_EVENT, onPrefsChange);
    return () => window.removeEventListener(PREFS_CHANGE_EVENT, onPrefsChange);
  }, []);

  useEffect(() => {
    if (!showHeaderNews) {
      setNews([]);
      return;
    }
    fetch(
      `https://newsapi.org/v2/everything?q=music&from=2025-08-07&sortBy=publishedAt&apiKey=13e231f3702947d7af33f10e4bc847fa`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.articles) {
          setNews(data.articles.map((a) => a.title));
        }
      })
      .catch((err) => console.error(err));
  }, [showHeaderNews]);

  useEffect(() => {
    if (news.length > 0) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % news.length);
      }, 9000);
      return () => clearInterval(interval);
    }
  }, [news]);

  const createButton = (label, icon, route, activePaths = [route]) => (
    <button
      active={activePaths.some((path) => location.pathname.startsWith(path))}
      onClick={() => navigate(route)}
    >
      {icon} {label}
    </button>
  );

  return (
    <header className="fixed top-0 left-0 z-[1100] flex h-[70px] w-full items-center justify-between overflow-visible border-b border-sb-border-strong bg-sb-base px-5">
      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative w-10 h-10 flex flex-col justify-center items-center"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          <span
            className={`block w-8 h-[3px] bg-sb-fg rounded transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-[8px]" : ""
            }`}
          />
          <span
            className={`block w-8 h-[3px] bg-white rounded transition-all duration-300 my-[6px] ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`block w-8 h-[3px] bg-sb-fg rounded transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-[8px]" : ""
            }`}
          />
        </button>

        <div
          onClick={() => navigate("/")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            cursor: "pointer",
          }}
        >
          <DiaTextReveal
            text="SoundBloom"
            colors={["#EE10B0", "#0E9EEF"]}
            finalGradient
            duration={1.6}
            className="text-2xl font-extrabold tracking-tight"
          />
        </div>
      </div>
      <div className="ml-10">
        <SearchBarWithHeader handlePlaySong={handlePlaySong} />
      </div>
      <div
        style={{
          position: "relative",
          height: "30px",
          overflow: "hidden",
          color: "var(--sb-fg)",
          fontSize: "16px",
          flex: 1,
          margin: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {showHeaderNews && news.length > 0 && (
          <div
            key={index}
            className="animate-news absolute w-full text-center px-4"
          >
            {news[index]}
          </div>
        )}
      </div>
      <Row gutter={30}>
        {[
          { labelKey: "nav.aboutUs", path: "/about" },
          { labelKey: "common.contact", path: "/contact" },
          { labelKey: "common.premium", path: "/premium" },
        ].map((item) => (
          <Col key={item.labelKey}>
            <button
              onClick={() => navigate(item.path)}
              className="text-[16px] font-normal text-sb-fg-muted hover:text-sb-fg transition-all"
            >
              {t(item.labelKey)}
            </button>
          </Col>
        ))}
      </Row>
      <div className="flex items-center gap-4 ml-10 overflow-visible relative z-[1200]">
        <AnimatedThemeToggler duration={500} variant="circle" />
        <LanguageSwitcher compact />
        {token ? (
          <div
            className={`flex items-center gap-4  transition-all duration-300 
      ${isLoggingOut ? "opacity-0 scale-95" : "opacity-100 scale-100"} mr-5`}
          >
            <button
              onClick={() => navigate("/settings")}
              className="flex items-center gap-1 text-white/70 hover:text-white transition"
              aria-label={t("common.settings")}
            >
              <SettingOutlined className="text-lg" />
            </button>

            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-1 rounded-lg border border-[#EE10B0]/30 bg-[#EE10B0]/10 px-2 py-1 text-[#EE10B0] hover:bg-[#EE10B0]/20 transition cursor-pointer"
                title={t("admin.open")}
                aria-label={t("admin.open")}
              >
                <CrownOutlined className="text-lg" />
              </button>
            )}

            {isOperator && (
              <button
                onClick={() => navigate("/operator")}
                className="flex items-center gap-1 rounded-lg border border-[#0E9EEF]/30 bg-[#0E9EEF]/10 px-2 py-1 text-[#0E9EEF] hover:bg-[#0E9EEF]/20 transition cursor-pointer"
                title={t("operator.open")}
                aria-label={t("operator.open")}
              >
                <SafetyCertificateOutlined className="text-lg" />
              </button>
            )}

            <div className="w-px h-10 bg-white/20 mx-2"></div>

            <div className="flex items-center gap-2 text-white">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20"
                />
              ) : (
                <UserOutlined className="text-xl" />
              )}
              <span className="text-base">{username || t("auth.username.label")}</span>
            </div>

            <button
              onClick={() => {
                setIsLoggingOut(true);
                setTimeout(() => {
                  clearAuthSession();
                  setToken(null);
                  setUsername("");
                  setIsLoggingOut(false);
                  navigate("/Home");
                }, 250);
              }}
              className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition"
            >
              <LogoutOutlined />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4  transition-all duration-300 opacity-100">
            <button
              onClick={() => navigate("/login")}
              className="text-sb-fg border border-sb-border px-4 py-2 rounded-lg hover:bg-sb-muted transition"
            >
              {t("common.login")}
            </button>

            <button
              onClick={() => navigate("/register")}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition font-medium"
            >
              {t("common.signUp")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
