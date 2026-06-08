import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  BarChartOutlined,
  CloseOutlined,
  CustomerServiceOutlined,
  DownloadOutlined,
  HeartOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  TeamOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { fetchTrackAnalytics } from "../../api/artistApi";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";
import { TRACK_STATUS_LABELS } from "../../constants/artistStudio";
import { formatPlaylistForPlayer } from "../../utils/formatTrackForPlayer";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161618] to-[#111113] p-4">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
          accent === "pink"
            ? "bg-[#EE10B0]/15 text-[#EE10B0]"
            : accent === "blue"
              ? "bg-[#0E9EEF]/15 text-[#0E9EEF]"
              : "bg-white/[0.06] text-white/70"
        }`}
      >
        <Icon className="text-lg" />
      </div>
      <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wider text-white/40">{label}</p>
    </div>
  );
}

function PlaysChart({ data, t }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
      <div className="mb-4 flex items-center gap-2">
        <BarChartOutlined className="text-[#0E9EEF]" />
        <h3 className="text-sm font-semibold text-white">
          {t("artist.analytics.playsChart")}
        </h3>
      </div>
      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((day) => {
          const height = `${Math.max(8, (day.count / max) * 100)}%`;
          const label = new Date(day.date).toLocaleDateString(undefined, {
            weekday: "short",
          });
          return (
            <div
              key={day.date}
              className="flex flex-1 flex-col items-center gap-2 min-w-0"
            >
              <span className="text-[10px] text-white/45 tabular-nums">
                {day.count}
              </span>
              <div
                className="w-full max-w-[36px] rounded-t-md bg-gradient-to-t from-[#EE10B0] to-[#0E9EEF]/80 transition-all"
                style={{ height }}
                title={`${day.date}: ${day.count}`}
              />
              <span className="text-[10px] text-white/35 truncate w-full text-center">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackAnalyticsModal({ trackId, onClose, onPlay }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setData(await fetchTrackAnalytics(trackId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("artist.error"));
    } finally {
      setLoading(false);
    }
  }, [trackId, t]);

  useEffect(() => {
    load();
  }, [load]);

  const statusKey = TRACK_STATUS_LABELS[data?.status] || TRACK_STATUS_LABELS.pending;

  const handlePlay = () => {
    if (!data?.audioUrl) return;
    onPlay?.(
      formatPlaylistForPlayer(
        [
          {
            id: data.id,
            source: "soundbloom",
            title: data.title,
            artist: data.artistName,
            cover: data.coverUrl,
            audio: data.audioUrl,
            music: data.audioUrl,
          },
        ],
        "soundbloom",
      ),
      0,
    );
    onClose?.();
  };

  return (
    <div
      className="fixed inset-0 z-[2100] flex items-start justify-center overflow-y-auto bg-black/80 p-4 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative my-4 w-full max-w-4xl rounded-3xl border border-white/10 bg-[#09090B] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute inset-x-0 top-0 h-48 rounded-t-3xl bg-gradient-to-br from-[#EE10B0]/20 via-transparent to-[#0E9EEF]/10 pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#EE10B0] mb-1">
                {t("artist.analytics.portal")}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {loading ? "…" : data?.title}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="rounded-xl border border-white/10 p-2.5 text-white/50 hover:text-white cursor-pointer"
                aria-label={t("admin.refresh")}
              >
                <ReloadOutlined />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 p-2.5 text-white/50 hover:text-white cursor-pointer"
              >
                <CloseOutlined />
              </button>
            </div>
          </div>

          {error && (
            <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          {loading && (
            <p className="py-20 text-center text-white/45">{t("common.loading")}</p>
          )}

          {!loading && data && (
            <>
              <div className="mb-8 flex flex-col sm:flex-row gap-6">
                <div className="shrink-0 mx-auto sm:mx-0">
                  {data.coverUrl ? (
                    <img
                      src={resolveMediaUrl(data.coverUrl)}
                      alt=""
                      className="h-40 w-40 sm:h-48 sm:w-48 rounded-2xl object-cover ring-2 ring-[#EE10B0]/30 shadow-xl"
                    />
                  ) : (
                    <div className="h-40 w-40 sm:h-48 sm:w-48 rounded-2xl bg-gradient-to-br from-[#EE10B0] to-[#0E9EEF] flex items-center justify-center">
                      <CustomerServiceOutlined className="text-5xl text-white/80" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                        data.status === "approved"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : data.status === "rejected"
                            ? "border-red-500/30 bg-red-500/10 text-red-300"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {t(statusKey)}
                    </span>
                    {data.genre && (
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
                        {data.genre}
                      </span>
                    )}
                  </div>
                  <p className="text-white/55">
                    <span className="text-white/35">{t("artist.analytics.by")}</span>{" "}
                    {data.authors || data.artistName}
                  </p>
                  {data.description && (
                    <p className="text-sm text-white/50 line-clamp-3">{data.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-white/40">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarOutlined />
                      {data.releaseDate
                        ? new Date(data.releaseDate).toLocaleDateString()
                        : "—"}
                    </span>
                    <span>
                      {t("artist.analytics.uploaded")}:{" "}
                      {data.createdAt
                        ? new Date(data.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  {data.status === "approved" && data.audioUrl && (
                    <button
                      type="button"
                      onClick={handlePlay}
                      className="inline-flex items-center gap-2 rounded-full bg-[#EE10B0] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#cb0094] cursor-pointer"
                    >
                      <PlayCircleOutlined />
                      {t("artist.analytics.preview")}
                    </button>
                  )}
                  {data.status === "rejected" && data.rejectionReason && (
                    <p className="text-sm text-red-300/90 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2">
                      {data.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                <StatCard
                  icon={PlayCircleOutlined}
                  label={t("artist.analytics.plays")}
                  value={data.playCount.toLocaleString()}
                  accent="pink"
                />
                <StatCard
                  icon={HeartOutlined}
                  label={t("artist.analytics.likes")}
                  value={data.likeCount.toLocaleString()}
                  accent="pink"
                />
                <StatCard
                  icon={TeamOutlined}
                  label={t("artist.analytics.listeners")}
                  value={data.uniqueListeners.toLocaleString()}
                  accent="blue"
                />
                <StatCard
                  icon={BarChartOutlined}
                  label={t("artist.analytics.plays7d")}
                  value={data.playsLast7Days.toLocaleString()}
                  accent="blue"
                />
                <StatCard
                  icon={DownloadOutlined}
                  label={t("artist.analytics.downloads")}
                  value={data.downloadCount.toLocaleString()}
                />
                <StatCard
                  icon={HeartOutlined}
                  label={t("artist.analytics.inLibrary")}
                  value={data.likeCount.toLocaleString()}
                  accent="pink"
                />
              </div>

              {data.playsByDay?.length > 0 && (
                <PlaysChart data={data.playsByDay} t={t} />
              )}

              {data.tags?.length > 0 && (
                <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
                  <h3 className="mb-3 text-sm font-semibold text-white/70">
                    {t("artist.analytics.tags")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[#0E9EEF]/25 bg-[#0E9EEF]/10 px-3 py-1 text-xs text-[#7ec8f7]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(data.mood || data.energy || data.tempo) && (
                <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
                  {data.mood && (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                      <span className="text-white/35">{t("artist.analytics.mood")}</span>
                      <p className="text-white font-medium capitalize">{data.mood}</p>
                    </div>
                  )}
                  {data.energy && (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                      <span className="text-white/35">{t("artist.analytics.energy")}</span>
                      <p className="text-white font-medium capitalize">{data.energy}</p>
                    </div>
                  )}
                  {data.tempo && (
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                      <span className="text-white/35">{t("artist.analytics.tempo")}</span>
                      <p className="text-white font-medium capitalize">{data.tempo}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
