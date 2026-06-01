import { useState } from "react";
import { HeartFilled, HeartOutlined } from "@ant-design/icons";
import { notifyError, notifyInfo, notifySuccess } from "../../utils/appNotification";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLibrary } from "../../state/libraryState";
import { getToken } from "../../utils/getToken";

export default function LikeButton({
  track,
  size = "md",
  className = "",
  showLabel = false,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuth } = getToken();
  const { isLiked, toggleLike } = useLibrary();
  const [busy, setBusy] = useState(false);

  if (!track?.id || !track?.source) return null;

  const source = String(track.source).toLowerCase();
  const liked = isLiked(source, track.id);

  const sizeClass =
    size === "sm"
      ? "text-base"
      : size === "lg"
        ? "text-2xl"
        : "text-xl";

  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuth) {
      notifyInfo(t("library.like.signIn"));
      navigate("/login");
      return;
    }

    if (busy) return;
    setBusy(true);
    try {
      const nowLiked = await toggleLike({ ...track, source });
      notifySuccess(
        nowLiked ? t("library.like.added") : t("library.like.removed"),
      );
    } catch (err) {
      notifyError(err.message || t("library.like.error"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      aria-label={liked ? t("common.liked") : t("common.like")}
      onClick={handleClick}
      disabled={busy}
      className={`group inline-flex items-center gap-1.5 rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 ${className}`}
    >
      {liked ? (
        <HeartFilled className={`${sizeClass} text-[#EE10B0] drop-shadow-[0_0_8px_rgba(238,16,176,0.5)]`} />
      ) : (
        <HeartOutlined
          className={`${sizeClass} text-white/50 group-hover:text-[#EE10B0] group-hover:scale-110 transition-all`}
        />
      )}
      {showLabel && (
        <span className={`text-sm font-medium ${liked ? "text-[#EE10B0]" : "text-white/60"}`}>
          {liked ? t("common.liked") : t("common.like")}
        </span>
      )}
    </button>
  );
}
