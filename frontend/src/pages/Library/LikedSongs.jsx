import { HeartFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import SongsTableAll from "../../components/SongsTableAll/SongsTableAll";
import LikeButton from "../../components/LikeButton/LikeButton";
import LibraryEmpty, {
  LibraryPageShell,
  countLabel,
} from "../../components/Library/LibraryLayout";
import { useLibrary } from "../../state/libraryState";
import usePlayerControls from "../../hooks/usePlayerControls";
import { likedTrackToPlayer } from "../../utils/formatTrackForPlayer";

export default function LikedSongs({ setCurrentPlaylist, setCurrentTrackIndex }) {
  const { t } = useTranslation();
  const { likes, loading } = useLibrary();
  const { handlePlaySong } = usePlayerControls(
    setCurrentPlaylist,
    setCurrentTrackIndex
  );

  const playerTracks = likes.map(likedTrackToPlayer);

  const playFromList = (index) => {
    handlePlaySong(playerTracks, index);
  };

  if (!loading && likes.length === 0) {
    return (
      <LibraryPageShell
        title={t("library.likedSongs.title")}
        subtitle={t("library.likedSongs.subtitle")}
      >
        <LibraryEmpty
          icon={HeartFilled}
          title={t("library.likedSongs.empty")}
          description={t("library.likedSongs.emptyHint")}
        />
      </LibraryPageShell>
    );
  }

  return (
    <LibraryPageShell
      title={t("library.likedSongs.title")}
      subtitle={countLabel(
        t,
        likes.length,
        "library.countTracks",
        "library.countTracks_plural"
      )}
    >
      {loading && likes.length === 0 ? (
        <div className="text-white/50 py-20 text-center">{t("common.loading")}</div>
      ) : (
        <SongsTableAll
          songs={playerTracks.map((tr, i) => ({
            ...tr,
            time: likes[i]?.createdAt
              ? new Date(likes[i].createdAt).toLocaleDateString()
              : "—",
            releaseDate: likes[i]?.album || "—",
          }))}
          onPlaySong={playFromList}
          columns={[
            {
              header: t("common.album"),
              render: (_, idx) => likes[idx]?.album || "—",
              width: "200px",
            },
            {
              header: t("common.liked"),
              render: (_, idx) => (
                <LikeButton track={playerTracks[idx]} size="sm" />
              ),
              width: "80px",
            },
          ]}
        />
      )}
    </LibraryPageShell>
  );
}
