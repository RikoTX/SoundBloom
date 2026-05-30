import { useState } from "react";
import { StarFilled, StarOutlined } from "@ant-design/icons";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLibrary } from "../../state/libraryState";
import { getToken } from "../../utils/getToken";

export default function SaveButton({ type, item, label, className = "" }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuth } = getToken();
  const {
    isAlbumSaved,
    toggleAlbum,
    isGenreSaved,
    toggleGenre,
    isPlaylistSaved,
    togglePlaylist,
  } = useLibrary();
  const [busy, setBusy] = useState(false);

  const saved =
    type === "album"
      ? isAlbumSaved(item?.id)
      : type === "genre"
        ? isGenreSaved(item?.tag)
        : type === "playlist"
          ? isPlaylistSaved(item?.id)
          : false;

  const typeLabel = t(`library.type.${type}`);

  const handleClick = async () => {
    if (!isAuth) {
      message.info(t("library.save.signIn"));
      navigate("/login");
      return;
    }

    if (busy || !item) return;
    setBusy(true);

    try {
      let nowSaved = false;
      if (type === "album") nowSaved = await toggleAlbum(item);
      else if (type === "genre") nowSaved = await toggleGenre(item);
      else if (type === "playlist") nowSaved = await togglePlaylist(item);

      message.success(
        nowSaved
          ? t("library.save.saved", { type: typeLabel })
          : t("library.save.removed", { type: typeLabel })
      );
    } catch (err) {
      message.error(err.message || t("library.save.error"));
    } finally {
      setBusy(false);
    }
  };

  const defaultLabel =
    type === "album"
      ? t("library.save.album")
      : type === "genre"
        ? t("library.save.genre")
        : t("library.save.playlist");

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={saved ? t("common.saved") : t("common.save")}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 ${
        saved
          ? "border-[#EE10B0]/50 bg-[#EE10B0]/15 text-[#EE10B0] shadow-[0_0_20px_rgba(238,16,176,0.15)]"
          : "border-white/15 bg-white/[0.06] text-white/90 hover:border-[#EE10B0]/40 hover:bg-[#EE10B0]/10 hover:text-white"
      } ${className}`}
    >
      {saved ? (
        <StarFilled className="text-[#EE10B0]" />
      ) : (
        <StarOutlined />
      )}
      {label || (saved ? t("common.saved") : defaultLabel)}
    </button>
  );
}
