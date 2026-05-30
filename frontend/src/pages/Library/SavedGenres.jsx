import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomerServiceOutlined } from "@ant-design/icons";
import LibraryEmpty, {
  LibraryPageShell,
  countLabel,
} from "../../components/Library/LibraryLayout";
import { useLibrary } from "../../state/libraryState";

function resolveSrc(src) {
  if (!src) return "";
  return src.startsWith("http") ? src : import.meta.env.BASE_URL + src;
}

export default function SavedGenres() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { savedGenres, loading } = useLibrary();

  if (!loading && savedGenres.length === 0) {
    return (
      <LibraryPageShell
        title={t("library.savedGenres.title")}
        subtitle={t("library.savedGenres.subtitle")}
      >
        <LibraryEmpty
          icon={CustomerServiceOutlined}
          title={t("library.savedGenres.empty")}
          description={t("library.savedGenres.emptyHint")}
        />
      </LibraryPageShell>
    );
  }

  return (
    <LibraryPageShell
      title={t("library.savedGenres.title")}
      subtitle={countLabel(
        t,
        savedGenres.length,
        "library.countGenres",
        "library.countGenres_plural"
      )}
    >
      {loading && savedGenres.length === 0 ? (
        <div className="text-white/50 py-20 text-center">{t("common.loading")}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {savedGenres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              onClick={() =>
                navigate(`/PageGenre/${genre.tag}`, {
                  state: { label: genre.label, from: "library" },
                })
              }
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#EE10B0]/40 transition-all"
            >
              {genre.cover ? (
                <img
                  src={resolveSrc(genre.cover)}
                  alt={genre.label}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a22] to-[#0a0a0f]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-lg">{genre.label}</p>
                <p className="text-white/50 text-xs mt-0.5">{t("common.genre")}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </LibraryPageShell>
  );
}
