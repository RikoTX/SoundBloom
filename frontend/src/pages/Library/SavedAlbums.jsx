import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppstoreOutlined } from "@ant-design/icons";
import LibraryEmpty, {
  LibraryPageShell,
  countLabel,
} from "../../components/Library/LibraryLayout";
import { useLibrary } from "../../state/libraryState";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";

export default function SavedAlbums() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { savedAlbums, loading } = useLibrary();

  if (!loading && savedAlbums.length === 0) {
    return (
      <LibraryPageShell
        title={t("library.savedAlbums.title")}
        subtitle={t("library.savedAlbums.subtitle")}
      >
        <LibraryEmpty
          icon={AppstoreOutlined}
          title={t("library.savedAlbums.empty")}
          description={t("library.savedAlbums.emptyHint")}
        />
      </LibraryPageShell>
    );
  }

  return (
    <LibraryPageShell
      title={t("library.savedAlbums.title")}
      subtitle={countLabel(
        t,
        savedAlbums.length,
        "library.countAlbums",
        "library.countAlbums_plural"
      )}
    >
      {loading && savedAlbums.length === 0 ? (
        <div className="text-white/50 py-20 text-center">{t("common.loading")}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {savedAlbums.map((album) => (
            <button
              key={album.id}
              type="button"
              onClick={() =>
                navigate(`/PageAlbums/${album.albumId}`, { state: { from: "library" } })
              }
              className="group text-left cursor-pointer bg-[#18181B] rounded-xl p-3 border border-white/5 hover:border-[#EE10B0]/30 hover:shadow-[0_8px_30px_rgba(238,16,176,0.12)] transition-all"
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-[#27272A]">
                {album.cover ? (
                  <img
                    src={resolveMediaUrl(album.cover)}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <AppstoreOutlined className="text-4xl" />
                  </div>
                )}
              </div>
              <p className="font-semibold text-white text-sm truncate">{album.title}</p>
              <p className="text-white/45 text-xs truncate mt-0.5">{album.artist}</p>
              {album.trackCount != null && (
                <p className="text-[#EE10B0]/70 text-xs mt-1">
                  {album.trackCount} {t("common.tracks")}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </LibraryPageShell>
  );
}
