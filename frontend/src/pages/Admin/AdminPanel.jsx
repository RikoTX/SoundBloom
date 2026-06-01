import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  CrownOutlined,
  UserAddOutlined,
  UserOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  GlobalOutlined,
  SearchOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  CameraOutlined,
  LoadingOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { getToken } from "../../utils/getToken";
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetAdminUserPassword,
  deleteAdminUser,
  fetchAdminStats,
  fetchAdminLogs,
  fetchAdminTranslations,
  upsertAdminTranslation,
  createAdminTranslationKey,
} from "../../api/adminApi";
import { changeAppLanguage, getStoredLocale } from "../../i18n";
import { fileToAvatarDataUrl } from "../../utils/avatarImage";
import { dispatchProfileChange } from "../../utils/authSession";
import { confirmAction, notifyError, notifySuccess } from "../../utils/appNotification";

const TABS = [
  { id: "users", icon: UserOutlined },
  { id: "data", icon: DatabaseOutlined },
  { id: "logs", icon: FileTextOutlined },
  { id: "translations", icon: GlobalOutlined },
];

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition cursor-pointer whitespace-nowrap ${
        active
          ? "bg-[#EE10B0]/20 text-[#EE10B0] border border-[#EE10B0]/40"
          : "border border-white/10 text-white/55 hover:text-white hover:border-white/20"
      }`}
    >
      <Icon />
      {label}
    </button>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5">
      <p className="text-xs uppercase tracking-wider text-white/35">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent ? "text-[#EE10B0]" : "text-white"}`}>
        {value ?? "—"}
      </p>
    </div>
  );
}

function UserEditModal({ user, onClose, onSaved, onDeleted }) {
  const { t } = useTranslation();
  const { userId: currentUserId } = getToken();
  const [username, setUsername] = useState(user.username || "");
  const [role, setRole] = useState(user.role || "user");
  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || null);
  const [clearAvatar, setClearAvatar] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState(null);

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setPendingAvatar(dataUrl);
      setAvatarPreview(dataUrl);
      setClearAvatar(false);
    } catch {
      setError(t("settings.account.avatarError"));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPendingAvatar(null);
    setAvatarPreview(null);
    setClearAvatar(true);
  };

  const isValidUsername = (value) => /^[a-z0-9_]{3,20}$/.test(value);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const trimmedUsername = username.trim().toLowerCase();
      const payload = {
        role,
        clearAvatar,
      };
      if (trimmedUsername && isValidUsername(trimmedUsername)) {
        payload.username = trimmedUsername;
      } else if (trimmedUsername && trimmedUsername.includes("@")) {
        setError(t("admin.users.usernameNotEmail"));
        setSaving(false);
        return;
      } else if (trimmedUsername) {
        setError(t("auth.validation.usernameFormat"));
        setSaving(false);
        return;
      }
      if (pendingAvatar) {
        payload.avatarData = pendingAvatar;
      }
      await updateAdminUser(user.id, payload);
      if (user.id === currentUserId) {
        dispatchProfileChange();
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      const msg = t("auth.changePassword.minLength");
      setPasswordFeedback({ type: "error", text: msg });
      notifyError(msg);
      return;
    }

    setResettingPassword(true);
    setError("");
    setPasswordFeedback(null);
    try {
      const result = await resetAdminUserPassword(user.id, newPassword);
      const loginEmail = result?.email || user.email;
      const successText = t("admin.users.passwordResetDone", { email: loginEmail });
      setNewPassword("");
      setPasswordFeedback({ type: "success", text: successText });
      notifySuccess(t("admin.users.passwordResetTitle"), successText);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("admin.error");
      setPasswordFeedback({ type: "error", text: msg });
      notifyError(t("admin.error"), msg);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDelete = async () => {
    if (user.id === currentUserId) {
      setError(t("admin.users.cannotDeleteSelf"));
      return;
    }
    const confirmed = await confirmAction({
      title: t("admin.users.deleteConfirm"),
      okText: t("common.yes"),
      cancelText: t("common.cancel"),
      danger: true,
    });
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      await deleteAdminUser(user.id);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.error"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("admin.users.editTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white cursor-pointer"
            aria-label={t("common.close")}
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="mb-5 flex flex-col items-center gap-3">
          <label className="group relative cursor-pointer">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt=""
                className="h-24 w-24 rounded-full object-cover ring-2 ring-[#EE10B0]/30"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#EE10B0] to-[#0E9EEF] text-3xl font-bold text-white">
                {(username || user.email || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
              {uploading ? (
                <LoadingOutlined className="text-xl text-white" />
              ) : (
                <CameraOutlined className="text-xl text-white" />
              )}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              disabled={uploading || saving || deleting}
              onChange={handleAvatarSelect}
            />
          </label>
          <p className="text-xs text-white/35">{t("admin.users.avatar")}</p>
          {(avatarPreview || user.avatarUrl) && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              disabled={uploading || saving || deleting}
              className="text-xs text-red-400/80 hover:text-red-300 cursor-pointer"
            >
              {t("settings.account.avatarRemove")}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/35">
              {t("common.email")}
            </label>
            <input
              value={user.email || "—"}
              readOnly
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-white/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/35">
              {t("auth.username.label")}
            </label>
            <input
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.replace(/\s/g, "").toLowerCase())
              }
              className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-white outline-none focus:border-[#EE10B0]/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/35">
              {t("admin.users.role")}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-white outline-none focus:border-[#EE10B0]/40"
            >
              <option value="user">user</option>
              <option value="operator">operator</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-wider text-white/35">
              {t("admin.users.newPassword")}
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordFeedback(null);
                }}
                placeholder="Qwerty123+"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-white outline-none focus:border-[#EE10B0]/40"
              />
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resettingPassword || newPassword.length < 8}
                className="shrink-0 rounded-xl border border-[#0E9EEF]/40 bg-[#0E9EEF]/10 px-3 py-2 text-xs text-[#0E9EEF] hover:bg-[#0E9EEF]/20 disabled:opacity-40 cursor-pointer"
              >
                {resettingPassword ? "…" : t("admin.users.resetPassword")}
              </button>
            </div>
            {passwordFeedback && (
              <p
                className={`mt-2 text-sm ${
                  passwordFeedback.type === "success"
                    ? "text-emerald-400"
                    : "text-red-300"
                }`}
              >
                {passwordFeedback.text}
              </p>
            )}
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || deleting || uploading}
            className="flex-1 rounded-full bg-[#EE10B0] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
          >
            {saving ? "…" : t("admin.users.save")}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving || deleting}
            className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:text-white cursor-pointer"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting || user.id === currentUserId}
            className="rounded-full border border-red-500/30 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-40 cursor-pointer"
          >
            {deleting ? "…" : t("admin.users.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateUserModal({ onClose, onCreated }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    setResult(null);
    try {
      const created = await createAdminUser({
        email: email.trim(),
        role,
        username: username.trim() || undefined,
      });
      setResult(created);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{t("admin.users.createTitle")}</h2>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white cursor-pointer">
            <CloseOutlined />
          </button>
        </div>

        {!result ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-white/45">{t("common.email")}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/45">{t("auth.username.label")}</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("admin.users.usernameOptional")}
                  className="w-full rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/45">{t("admin.users.role")}</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-sm text-white"
                >
                  <option value="user">user</option>
                  <option value="operator">operator</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleCreate}
                disabled={saving || !email.trim()}
                className="flex-1 rounded-full bg-[#EE10B0] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
              >
                {saving ? "…" : t("admin.users.createSubmit")}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/60 cursor-pointer"
              >
                {t("common.cancel")}
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3 text-sm text-white/80">
            <p className="text-emerald-400">{result.message}</p>
            {result.emailSent ? (
              <p>{t("admin.users.createEmailSent", { email: result.email })}</p>
            ) : (
              <>
                <p className="text-amber-300">{t("admin.users.createSmtpHint")}</p>
                <div className="rounded-lg border border-white/10 bg-[#09090B] p-3 font-mono text-xs break-all">
                  {result.temporaryPassword}
                </div>
                <p className="text-xs text-white/40">
                  {t("admin.users.createExpires", {
                    date: new Date(result.tempPasswordExpiresAt).toLocaleString(),
                  })}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full rounded-full bg-[#EE10B0] px-5 py-2.5 text-sm font-semibold text-white cursor-pointer"
            >
              {t("common.close")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersTab() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [success, setSuccess] = useState("");
  const { userId: currentUserId } = getToken();

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await fetchAdminUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-white/45">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-4">
      {creatingUser && (
        <CreateUserModal
          onClose={() => setCreatingUser(false)}
          onCreated={load}
        />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={() => {
            setEditingUser(null);
            const msg = t("admin.users.saved");
            setSuccess(msg);
            notifySuccess(msg);
            load();
            setTimeout(() => setSuccess(""), 3000);
          }}
          onDeleted={() => {
            setEditingUser(null);
            load();
          }}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-white/45">{t("admin.users.count", { count: users.length })}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCreatingUser(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EE10B0]/20 border border-[#EE10B0]/40 px-3 py-1.5 text-xs text-[#EE10B0] hover:bg-[#EE10B0]/30 cursor-pointer"
          >
            <UserAddOutlined /> {t("admin.users.create")}
          </button>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white cursor-pointer"
          >
            <ReloadOutlined /> {t("admin.refresh")}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {success && (
        <p className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckOutlined /> {success}
        </p>
      )}
      {users.length === 0 ? (
        <p className="text-center text-white/40 py-8">{t("admin.users.empty")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-white/45">
              <tr>
                <th className="px-4 py-3 font-medium">{t("common.email")}</th>
                <th className="px-4 py-3 font-medium">{t("auth.username.label")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.users.role")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.users.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-white/[0.06] text-white/80">
                  <td className="px-4 py-3">{user.email || "—"}</td>
                  <td className="px-4 py-3">{user.username || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-[#EE10B0]/15 text-[#EE10B0]"
                          : user.role === "operator"
                            ? "bg-[#0E9EEF]/15 text-[#0E9EEF]"
                            : "bg-white/10 text-white/60"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-xs hover:border-[#EE10B0]/40 hover:text-[#EE10B0] cursor-pointer"
                      >
                        <EditOutlined /> {t("admin.users.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (user.id === currentUserId) {
                            setError(t("admin.users.cannotDeleteSelf"));
                            return;
                          }
                          const confirmed = await confirmAction({
                            title: t("admin.users.deleteConfirm"),
                            okText: t("common.yes"),
                            cancelText: t("common.cancel"),
                            danger: true,
                          });
                          if (!confirmed) return;
                          try {
                            await deleteAdminUser(user.id);
                            notifySuccess(t("admin.users.deleted"));
                            await load();
                          } catch (err) {
                            setError(err instanceof Error ? err.message : t("admin.error"));
                          }
                        }}
                        disabled={user.id === currentUserId}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 px-3 py-1 text-xs text-red-400 hover:bg-red-500/10 disabled:opacity-40 cursor-pointer"
                      >
                        <DeleteOutlined /> {t("admin.users.delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DataTab() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    fetchAdminStats()
      .then(setStats)
      .catch((err) => {
        setStats(null);
        setError(err instanceof Error ? err.message : t("admin.data.error"));
      })
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-white/45">{t("common.loading")}</p>;

  const cards = [
    { label: t("admin.data.users"), value: stats?.users ?? 0, accent: true },
    { label: t("admin.data.admins"), value: stats?.admins ?? 0 },
    { label: t("admin.data.translationKeys"), value: stats?.translationKeys ?? 0 },
    { label: t("admin.data.translationRows"), value: stats?.translationRows ?? 0 },
    { label: t("admin.data.likedTracks"), value: stats?.likedTracks ?? 0 },
    { label: t("admin.data.savedAlbums"), value: stats?.savedAlbums ?? 0 },
    { label: t("admin.data.savedGenres"), value: stats?.savedGenres ?? 0 },
    { label: t("admin.data.savedPlaylists"), value: stats?.savedPlaylists ?? 0 },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-red-300">{error}</p>
          <button
            type="button"
            onClick={load}
            className="text-xs text-[#EE10B0] hover:underline cursor-pointer"
          >
            {t("admin.refresh")}
          </button>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}

function LogsTab() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminLogs(120)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-white/45">{t("common.loading")}</p>;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-white cursor-pointer"
        >
          <ReloadOutlined /> {t("admin.refresh")}
        </button>
      </div>
      <p className="text-xs text-white/35">{t("admin.logs.hint")}</p>
      <div className="max-h-[520px] overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0c0c0e]">
        {logs.length === 0 ? (
          <p className="p-6 text-center text-white/40">{t("admin.logs.empty")}</p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="border-b border-white/[0.05] px-4 py-3 text-sm last:border-0"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${
                    log.level === "warn"
                      ? "bg-amber-500/15 text-amber-300"
                      : "bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-white/35">{log.category}</span>
                <span className="text-white/25 text-xs">
                  {new Date(log.at).toLocaleString()}
                </span>
                {log.actor && (
                  <span className="text-white/25 text-xs">· {log.actor}</span>
                )}
              </div>
              <p className="mt-1 text-white/75">{log.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TranslationsTab() {
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(null);
  const [editValues, setEditValues] = useState({ en: "", ru: "", kk: "" });
  const [newKey, setNewKey] = useState({
    key: "",
    en: "",
    ru: "",
    kk: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await fetchAdminTranslations(search));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.error"));
    } finally {
      setLoading(false);
    }
  }, [search, t]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const startEdit = (row) => {
    setEditing(row.key);
    setEditValues({ en: row.en || "", ru: row.ru || "", kk: row.kk || "" });
    setSuccess("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setError("");
    try {
      for (const locale of ["en", "ru", "kk"]) {
        const value = editValues[locale];
        if (value !== undefined && value !== "") {
          await upsertAdminTranslation({
            key: editing,
            locale,
            value,
            namespace: editing.split(".")[0],
          });
        }
      }
      const msg = t("admin.translations.saved");
      setSuccess(msg);
      notifySuccess(msg);
      setEditing(null);
      await load();
      await changeAppLanguage(getStoredLocale());
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.error"));
    }
  };

  const createKey = async () => {
    setError("");
    try {
      await createAdminTranslationKey(newKey);
      setNewKey({ key: "", en: "", ru: "", kk: "" });
      const createdMsg = t("admin.translations.created");
      setSuccess(createdMsg);
      notifySuccess(createdMsg);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("admin.error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.translations.search")}
            className="w-full rounded-xl border border-white/10 bg-[#09090B] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-[#EE10B0]/40"
          />
        </div>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white cursor-pointer"
        >
          <ReloadOutlined /> {t("admin.refresh")}
        </button>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}
      {success && (
        <p className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckOutlined /> {success}
        </p>
      )}

      <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-4 sm:p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">
          {t("admin.translations.addKey")}
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={newKey.key}
            onChange={(e) => setNewKey((k) => ({ ...k, key: e.target.value }))}
            placeholder="settings.newKey"
            className="rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-sm text-white sm:col-span-2"
          />
          <input
            value={newKey.en}
            onChange={(e) => setNewKey((k) => ({ ...k, en: e.target.value }))}
            placeholder="English"
            className="rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-sm text-white"
          />
          <input
            value={newKey.ru}
            onChange={(e) => setNewKey((k) => ({ ...k, ru: e.target.value }))}
            placeholder="Русский"
            className="rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-sm text-white"
          />
          <input
            value={newKey.kk}
            onChange={(e) => setNewKey((k) => ({ ...k, kk: e.target.value }))}
            placeholder="Қазақша"
            className="rounded-lg border border-white/10 bg-[#09090B] px-3 py-2 text-sm text-white sm:col-span-2"
          />
        </div>
        <button
          type="button"
          onClick={createKey}
          disabled={!newKey.key.trim()}
          className="mt-3 rounded-full bg-[#EE10B0] px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 cursor-pointer"
        >
          {t("admin.translations.create")}
        </button>
      </div>

      {loading ? (
        <p className="text-white/45">{t("common.loading")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/[0.03] text-left text-white/45">
              <tr>
                <th className="px-3 py-3">{t("admin.translations.key")}</th>
                <th className="px-3 py-3">EN</th>
                <th className="px-3 py-3">RU</th>
                <th className="px-3 py-3">KK</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 80).map((row) => (
                <tr key={row.key} className="border-t border-white/[0.06] align-top">
                  <td className="px-3 py-3 font-mono text-xs text-[#EE10B0]">{row.key}</td>
                  {editing === row.key ? (
                    <>
                      {["en", "ru", "kk"].map((loc) => (
                        <td key={loc} className="px-3 py-2">
                          <textarea
                            value={editValues[loc]}
                            onChange={(e) =>
                              setEditValues((v) => ({ ...v, [loc]: e.target.value }))
                            }
                            rows={2}
                            className="w-full min-w-[120px] rounded border border-white/10 bg-[#09090B] p-2 text-xs text-white"
                          />
                        </td>
                      ))}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={saveEdit}
                          className="mr-2 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        >
                          <CheckOutlined />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="text-white/40 hover:text-white cursor-pointer"
                        >
                          <DeleteOutlined />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-3 text-white/70 max-w-[180px] truncate">{row.en}</td>
                      <td className="px-3 py-3 text-white/70 max-w-[180px] truncate">{row.ru}</td>
                      <td className="px-3 py-3 text-white/70 max-w-[180px] truncate">{row.kk}</td>
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => startEdit(row)}
                          className="text-xs text-[#EE10B0] hover:underline cursor-pointer"
                        >
                          {t("admin.translations.edit")}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 80 && (
            <p className="border-t border-white/[0.06] p-3 text-xs text-white/35">
              {t("admin.translations.truncated", { count: rows.length })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAdmin } = getToken();
  const [tab, setTab] = useState("users");

  const tabLabels = useMemo(
    () => ({
      users: t("admin.tabs.users"),
      data: t("admin.tabs.data"),
      logs: t("admin.tabs.logs"),
      translations: t("admin.tabs.translations"),
    }),
    [t],
  );

  useEffect(() => {
    if (!isAdmin) {
      navigate("/Home", { replace: true });
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 pb-32 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          type="button"
          onClick={() => navigate("/Home")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white cursor-pointer"
        >
          <ArrowLeftOutlined /> {t("common.backToHome")}
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EE10B0]/15 text-xl text-[#EE10B0]">
            <CrownOutlined />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{t("admin.title")}</h1>
            <p className="text-white/45">{t("admin.subtitle")}</p>
          </div>
        </div>
      </motion.div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map(({ id, icon }) => (
          <TabButton
            key={id}
            icon={icon}
            label={tabLabels[id]}
            active={tab === id}
            onClick={() => setTab(id)}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#111113] p-5 sm:p-6">
        {tab === "users" && <UsersTab />}
        {tab === "data" && <DataTab />}
        {tab === "logs" && <LogsTab />}
        {tab === "translations" && <TranslationsTab />}
      </div>
    </div>
  );
}
