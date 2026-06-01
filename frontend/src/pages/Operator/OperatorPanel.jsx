import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { getToken } from "../../utils/getToken";
import { LibraryPageShell } from "../../components/Library/LibraryLayout";
import {
  approveTrack,
  fetchOperatorTrackDetail,
  fetchPendingTracks,
  rejectTrack,
} from "../../api/operatorApi";
import { notifySuccess } from "../../utils/appNotification";

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm border-b border-white/[0.06] py-2">
      <span className="text-white/45">{label}</span>
      <span className="text-white/85 break-words">{value}</span>
    </div>
  );
}

function ModerationModal({ trackId, onClose, onDone }) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [approveConfirm, setApproveConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchOperatorTrackDetail(trackId);
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("common.requestFailed"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trackId, t]);

  const submitApprove = async () => {
    setBusy(true);
    setError("");
    try {
      await approveTrack(trackId);
      notifySuccess(t("operator.approved"));
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.requestFailed"));
    } finally {
      setBusy(false);
      setApproveConfirm(false);
    }
  };

  const handleReject = async () => {
    setBusy(true);
    setError("");
    try {
      await rejectTrack(trackId, reason);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.requestFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("operator.detailTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white cursor-pointer"
            aria-label={t("common.close")}
          >
            <CloseOutlined />
          </button>
        </div>

        {loading && <p className="text-white/45">{t("common.loading")}</p>}
        {error && <p className="mb-3 text-sm text-red-300">{error}</p>}

        {detail && !loading && (
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="shrink-0">
              {detail.coverUrl ? (
                <img
                  src={detail.coverUrl}
                  alt=""
                  className="h-40 w-40 rounded-xl object-cover"
                />
              ) : (
                <div className="h-40 w-40 rounded-xl bg-gradient-to-br from-[#EE10B0] to-[#0E9EEF]" />
              )}
              {detail.audioUrl && (
                <div className="mt-3">
                  <p className="mb-1 text-xs text-white/45">{t("operator.audio")}</p>
                  <audio controls src={detail.audioUrl} className="w-full max-w-[240px]" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-white mb-1">{detail.title}</h3>
              <p className="text-sm text-white/45 mb-3">
                {detail.artistName} · {detail.artistEmail}
              </p>

              <DetailRow label={t("artist.tracks.colRelease")} value={detail.releaseDate} />
              <DetailRow label={t("artist.upload.authors")} value={detail.authors} />
              <DetailRow label={t("artist.upload.description")} value={detail.description} />
              <DetailRow label={t("artist.upload.language")} value={detail.language} />
              <DetailRow
                label={t("artist.upload.explicit")}
                value={detail.explicitLanguage ? t("common.yes") : t("common.no")}
              />
              <DetailRow label={t("artist.upload.vocalGender")} value={detail.vocalType} />
              <DetailRow label={t("artist.upload.proCode")} value={detail.proCode} />
              <DetailRow
                label={t("artist.upload.tempo")}
                value={[detail.tempo, detail.energy, detail.mood, detail.electricAcoustic]
                  .filter(Boolean)
                  .join(" · ")}
              />
              <DetailRow
                label={t("operator.tags")}
                value={detail.tags?.length ? detail.tags.join(", ") : null}
              />
              <DetailRow
                label={t("operator.license")}
                value={`${detail.commercialUse ? t("artist.upload.commercial") : ""}${
                  detail.allowDerivatives ? ` · ${detail.allowDerivatives}` : ""
                }`}
              />

              {!detail.isInstrumental && detail.lyricsText && (
                <div className="mt-3 rounded-lg bg-white/[0.03] p-3 text-xs text-white/60 max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {detail.lyricsText}
                </div>
              )}
            </div>
          </div>
        )}

        {detail && !loading && (
          <div className="mt-6 border-t border-white/10 pt-4">
            <label className="block text-xs text-white/45 mb-1">{t("operator.rejectReason")}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={t("operator.rejectPlaceholder")}
              className="w-full rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-sm text-white placeholder:text-white/30"
            />
            {approveConfirm && (
              <p className="mb-3 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                {t("operator.approveConfirm")}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                disabled={busy}
                onClick={handleReject}
                className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50 cursor-pointer"
              >
                <CloseOutlined /> {t("operator.reject")}
              </button>
              {approveConfirm ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setApproveConfirm(false)}
                    className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white disabled:opacity-50 cursor-pointer"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={submitApprove}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                  >
                    <CheckOutlined /> {t("common.yes")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setApproveConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                >
                  <CheckOutlined /> {t("operator.approve")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OperatorPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuth, isOperator } = getToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tracks, setTracks] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setTracks(await fetchPendingTracks());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.requestFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
      return;
    }
    if (!isOperator) {
      navigate("/Home");
      return;
    }
    load();
  }, [isAuth, isOperator, navigate, load]);

  if (!isAuth || !isOperator) return null;

  return (
    <LibraryPageShell title={t("operator.title")} subtitle={t("operator.subtitle")}>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white cursor-pointer"
        >
          <ReloadOutlined /> {t("admin.refresh")}
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

      {loading ? (
        <p className="text-white/45">{t("common.loading")}</p>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center text-white/45">
          <SafetyCertificateOutlined className="text-4xl mb-3 text-[#EE10B0]/60" />
          <p>{t("operator.empty")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-white/45">
              <tr>
                <th className="px-4 py-3 font-medium">{t("artist.tracks.colCover")}</th>
                <th className="px-4 py-3 font-medium">{t("operator.colTitle")}</th>
                <th className="px-4 py-3 font-medium">{t("operator.colArtist")}</th>
                <th className="px-4 py-3 font-medium">{t("artist.tracks.colRelease")}</th>
                <th className="px-4 py-3 font-medium">{t("operator.colSubmitted")}</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => (
                <tr
                  key={track.id}
                  onClick={() => setSelectedId(track.id)}
                  className="border-t border-white/[0.06] text-white/80 hover:bg-white/[0.04] cursor-pointer"
                >
                  <td className="px-4 py-3">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt=""
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#EE10B0] to-[#0E9EEF]" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{track.title}</td>
                  <td className="px-4 py-3">
                    <div>{track.artistName}</div>
                    <div className="text-xs text-white/40">{track.artistEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-white/50">
                    {track.releaseDate
                      ? new Date(track.releaseDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/45">
                    {track.createdAt
                      ? new Date(track.createdAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && (
        <ModerationModal
          trackId={selectedId}
          onClose={() => setSelectedId(null)}
          onDone={() => {
            setSelectedId(null);
            load();
          }}
        />
      )}
    </LibraryPageShell>
  );
}
