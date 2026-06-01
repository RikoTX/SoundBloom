import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomButton from "../Button/Button";
import {
  HomeOutlined,
  SearchOutlined,
  StarOutlined,
  UserOutlined,
  HeartOutlined,
  ProfileOutlined,
  AppstoreOutlined,
  CustomerServiceOutlined,
  CloudUploadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { getToken } from "../../utils/getToken";
import { SiderText } from "./SiderText";
import ShineBorder from "../ShineBorder/ShineBorder";

export default function SiderMenu({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const from = location.state?.from;
  const { isAuth, isOperator } = getToken();

  const createButton = (labelKey, icon, route, activePaths = [route]) => (
    <CustomButton
      active={activePaths.some((path) => location.pathname.startsWith(path))}
      onClick={() => navigate(route)}
    >
      {icon} {isOpen && t(labelKey)}
    </CustomButton>
  );

  return (
    <motion.div
      animate={{ x: isOpen ? 0 : -250 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 z-[1000] h-screen w-[250px] flex flex-col bg-sb-base border-r-2 border-[#cb0094] shadow-[1px_0_10px_#cb0094]"
    >
      <div className="flex flex-col flex-1 items-start px-5 pt-10 overflow-y-auto mt-8">
        <SiderText siderText={t("nav.menu")} />
        <div className="flex flex-col items-center gap-3 mt-5 w-full">
          {createButton("nav.home", <HomeOutlined />, "/Home", [
            "/Home",
            ...(location.pathname.startsWith("/PageAlbums") && from === "home"
              ? ["/PageAlbums"]
              : []),
          ])}

          {createButton("nav.search", <SearchOutlined />, "/Search")}
          {createButton("nav.popular", <StarOutlined />, "/Popular", [
            "/Popular",
            ...(location.pathname.startsWith("/PageAlbums") &&
            from === "popular"
              ? ["/PageAlbums"]
              : []),
          ])}

          {createButton("nav.artist", <UserOutlined />, "/Artist", [
            "/Artist",
            "/PageArtists",
          ])}
        </div>
        <div className="mt-5 flex w-full flex-col items-center">
          {isAuth ? (
            <>
              <SiderText siderText={t("nav.playlistsFavorites")} />
              <div className="flex w-full flex-col items-center gap-3 mt-5">
                {createButton("nav.likedSongs", <HeartOutlined />, "/LikedSongs")}
                {createButton("nav.savedAlbums", <AppstoreOutlined />, "/SavedAlbums")}
                {createButton("nav.savedGenres", <CustomerServiceOutlined />, "/SavedGenres")}
                {createButton("nav.savedPlaylists", <ProfileOutlined />, "/SavedPlaylists")}
                {createButton("nav.myTracks", <CloudUploadOutlined />, "/MyTracks")}
                {isOperator &&
                  createButton("nav.moderation", <SafetyCertificateOutlined />, "/operator")}
              </div>
            </>
          ) : (
            <div className="relative overflow-hidden flex flex-col items-center gap-4 bg-sb-muted p-4 rounded-lg w-full">
              <ShineBorder
                borderWidth={1.5}
                duration={10}
                shineColor={["#cb0094", "#ee10b0", "#A07CFE"]}
              />
              <div className="w-[50px] h-[50px] bg-sb-card rounded-full flex items-center justify-center">
                <UserOutlined style={{ color: "var(--sb-fg-subtle)", fontSize: 24 }} />
              </div>
              <div className="text-center text-sb-fg flex flex-col gap-2">
                {t("nav.signInToAccess")}
                <span className="text-xs text-sb-fg-subtle">
                  {t("nav.playlistsHint")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="mt-2 bg-pink-500 text-white px-10 py-2 rounded-lg hover:bg-pink-600 transition cursor-pointer"
              >
                {t("common.signUp")}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
