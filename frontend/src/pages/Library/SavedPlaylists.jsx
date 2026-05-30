import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ProfileOutlined } from "@ant-design/icons";
import LibraryEmpty, {
  LibraryPageShell,
  countLabel,
} from "../../components/Library/LibraryLayout";
import { useLibrary } from "../../state/libraryState";

function resolveSrc(src) {
  if (!src) return "";
  return src.startsWith("http") ? src : import.meta.env.BASE_URL + src;
}

export default function SavedPlaylists() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { savedPlaylists, loading } = useLibrary();

  if (!loading && savedPlaylists.length === 0) {
    return (
      <LibraryPageShell
        title={t("library.savedPlaylists.title")}
        subtitle={t("library.savedPlaylists.subtitle")}
      >
        <LibraryEmpty
          icon={ProfileOutlined}
          title={t("library.savedPlaylists.empty")}
          description={t("library.savedPlaylists.emptyHint")}
        />
      </LibraryPageShell>
    );
  }

  return (
    <LibraryPageShell
      title={t("library.savedPlaylists.title")}
      subtitle={countLabel(
        t,
        savedPlaylists.length,
        "library.countPlaylists",
        "library.countPlaylists_plural"
      )}
    >
      {loading && savedPlaylists.length === 0 ? (
        <div className="text-white/50 py-20 text-center">{t("common.loading")}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {savedPlaylists.map((playlist) => (
            <button
              key={playlist.id}
              type="button"
              onClick={() => navigate(`/PagePlaylist/${playlist.playlistId}`)}
              className="group text-left cursor-pointer bg-[#18181B] rounded-xl p-3 border border-white/5 hover:border-[#EE10B0]/30 hover:shadow-[0_8px_30px_rgba(238,16,176,0.12)] transition-all"
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-[#27272A]">
                {playlist.cover ? (
                  <img
                    src={resolveSrc(playlist.cover)}
                    alt={playlist.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <ProfileOutlined className="text-4xl" />
                  </div>
                )}
              </div>
              <p className="font-semibold text-white text-sm truncate">{playlist.title}</p>
              {playlist.userName && (
                <p className="text-white/45 text-xs truncate mt-0.5">
                  {t("library.byUser", { name: playlist.userName })}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </LibraryPageShell>
  );
}
