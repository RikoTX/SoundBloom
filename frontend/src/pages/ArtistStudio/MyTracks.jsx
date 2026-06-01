import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  CustomerServiceOutlined,
  PlusOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { getToken } from "../../utils/getToken";
import { fetchArtistStudio, deleteArtistTrack } from "../../api/artistApi";
import { LibraryPageShell } from "../../components/Library/LibraryLayout";
import ArtistRegistrationWizard from "../../components/artist/ArtistRegistrationWizard";
import TrackUploadModal from "../../components/artist/TrackUploadModal";
import TrackAnalyticsModal from "../../components/artist/TrackAnalyticsModal";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import { TRACK_STATUS_LABELS } from "../../constants/artistStudio";
import { confirmAction, notifySuccess } from "../../utils/appNotification";

function StatusBadge({ status, t }) {
  const styles = {
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    rejected: "bg-red-500/15 text-red-300 border-red-500/25",
  };
  const key = TRACK_STATUS_LABELS[status] || TRACK_STATUS_LABELS.pending;
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
        styles[status] || styles.pending
      }`}
    >
      {t(key)}
    </span>
  );
}

export default function MyTracks({
  setCurrentTrackIndex,
  setCurrentPlaylist,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuth } = getToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studio, setStudio] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [analyticsTrackId, setAnalyticsTrackId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setStudio(await fetchArtistStudio());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("artist.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
      return;
    }
    load();
  }, [isAuth, navigate, load]);

  const handleDelete = async (trackId) => {
    const confirmed = await confirmAction({
      title: t("artist.tracks.deleteConfirm"),
      okText: t("common.yes"),
      cancelText: t("common.cancel"),
      danger: true,
    });
    if (!confirmed) return;
    try {
      await deleteArtistTrack(trackId);
      notifySuccess(t("artist.tracks.deleted"));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("artist.error"));
    }
  };

  if (!isAuth) return null;

  if (loading) {
    return (
      <LibraryPageShell title={t("nav.myTracks")} subtitle={t("artist.subtitle")}>
        <p className="text-white/45">{t("common.loading")}</p>
      </LibraryPageShell>
    );
  }

  if (!studio?.hasArtist) {
    return (
      <LibraryPageShell title={t("nav.myTracks")} subtitle={t("artist.register.intro")}>
        <ArtistRegistrationWizard onComplete={load} />
      </LibraryPageShell>
    );
  }

  const tracks = studio.tracks || [];

  return (
    <LibraryPageShell title={t("nav.myTracks")} subtitle={t("artist.subtitle")}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/45">
          {studio.artist?.name} · {studio.artist?.genre}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white cursor-pointer"
          >
            <ReloadOutlined /> {t("admin.refresh")}
          </button>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#EE10B0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#cb0094] cursor-pointer"
          >
            <PlusOutlined /> {t("artist.tracks.upload")}
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

      {tracks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#111113] to-[#09090B] px-6 py-16 text-center"
        >
          <div className="relative mb-8">
            <div className="h-32 w-32 rounded-full bg-[#EE10B0]/10 flex items-center justify-center">
              <CustomerServiceOutlined className="text-5xl text-[#EE10B0]" />
            </div>
            <div className="absolute -right-2 -top-2 h-10 w-10 rounded-full bg-[#0E9EEF]/20 flex items-center justify-center">
              <span className="text-lg">♪</span>
            </div>
            <div className="absolute -left-3 bottom-0 h-8 w-8 rounded-full bg-[#EE10B0]/20 flex items-center justify-center text-sm">
              ♫
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{t("artist.tracks.emptyTitle")}</h2>
          <p className="text-white/45 max-w-sm mb-8">{t("artist.tracks.emptyDesc")}</p>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="rounded-full bg-[#EE10B0] px-8 py-3 text-sm font-semibold text-white hover:bg-[#cb0094] cursor-pointer"
          >
            {t("artist.tracks.uploadFirst")}
          </button>
        </motion.div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-white/45">
              <tr>
                <th className="px-4 py-3 font-medium">{t("artist.tracks.colCover")}</th>
                <th className="px-4 py-3 font-medium">{t("artist.tracks.colTitle")}</th>
                <th className="px-4 py-3 font-medium">{t("artist.tracks.colRelease")}</th>
                <th className="px-4 py-3 font-medium">{t("artist.tracks.colStatus")}</th>
                <th className="px-4 py-3 font-medium">{t("artist.tracks.colPlays")}</th>
                <th className="px-4 py-3 font-medium">{t("artist.tracks.colDownloads")}</th>
                <th className="px-4 py-3 font-medium">{t("artist.tracks.colUploaded")}</th>
                <th className="px-4 py-3 font-medium">{t("artist.tracks.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => (
                <tr
                  key={track.id}
                  className="border-t border-white/[0.06] text-white/80 hover:bg-white/[0.03] cursor-pointer transition-colors"
                  onClick={() => setAnalyticsTrackId(track.id)}
                >
                  <td className="px-4 py-3">
                    {track.coverUrl ? (
                      <img
                        src={resolveMediaUrl(track.coverUrl)}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#EE10B0] to-[#0E9EEF]" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{track.title}</td>
                  <td className="px-4 py-3 text-white/50">
                    {track.releaseDate
                      ? new Date(track.releaseDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={track.status} t={t} />
                    {track.status === "rejected" && track.rejectionReason && (
                      <p className="mt-1 max-w-xs text-xs text-red-300/80" title={track.rejectionReason}>
                        {track.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">{track.playCount ?? 0}</td>
                  <td className="px-4 py-3">{track.downloadCount ?? 0}</td>
                  <td className="px-4 py-3 text-white/45">
                    {track.createdAt
                      ? new Date(track.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAnalyticsTrackId(track.id)}
                        className="rounded-lg border border-[#0E9EEF]/25 px-2 py-1 text-xs text-[#0E9EEF] hover:bg-[#0E9EEF]/10 cursor-pointer"
                      >
                        {t("artist.analytics.open")}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(track.id)}
                        className="rounded-lg border border-red-500/20 p-1.5 text-red-400/70 hover:bg-red-500/10 cursor-pointer"
                        title={t("artist.tracks.delete")}
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {analyticsTrackId && (
        <TrackAnalyticsModal
          trackId={analyticsTrackId}
          onClose={() => {
            setAnalyticsTrackId(null);
            load();
          }}
          onPlay={(playlist, index) => {
            setCurrentPlaylist?.(playlist);
            setCurrentTrackIndex?.(index);
          }}
        />
      )}

      {uploadOpen && (
        <TrackUploadModal
          artistProSociety={studio.artist?.proSociety}
          onClose={() => setUploadOpen(false)}
          onSaved={() => {
            setUploadOpen(false);
            load();
          }}
        />
      )}
    </LibraryPageShell>
  );
}
