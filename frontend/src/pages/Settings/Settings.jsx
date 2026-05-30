import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  UserOutlined,
  GlobalOutlined,
  CustomerServiceOutlined,
  BgColorsOutlined,
  DatabaseOutlined,
  SafetyOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  DeleteOutlined,
  CrownOutlined,
  HeartOutlined,
  StarOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  CheckOutlined,
  MailOutlined,
  CameraOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { getToken } from "../../utils/getToken";
import { clearAuthSession, dispatchProfileChange } from "../../utils/authSession";
import { fetchMe, checkUsername, setUsername, uploadAvatar, removeAvatar } from "../../api/authApi";
import { fileToAvatarDataUrl } from "../../utils/avatarImage";
import {
  changeAppLanguage,
  SUPPORTED_LOCALES,
  getStoredLocale,
} from "../../i18n";
import {
  getAllPreferences,
  setPreference,
  resetPreferences,
  getPlayerVolume,
  setPlayerVolume,
  clearLocalAppData,
  PREFS_CHANGE_EVENT,
} from "../../utils/userPreferences";
import { useLibrary } from "../../state/libraryState";

const LOCALE_LABELS = { en: "lang.en", ru: "lang.ru", kk: "lang.kk" };
const APP_VERSION = "1.0.0";

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#111113] overflow-hidden">
      <div className="flex items-start gap-4 border-b border-white/[0.06] px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EE10B0]/10 text-[#EE10B0]">
          <Icon />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-white/40">{description}</p>
          )}
        </div>
      </div>
      <div className="px-5 py-4 sm:px-6 sm:py-5 space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({ label, hint, checked, onChange, disabled }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/90">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-white/40">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer disabled:opacity-40 ${
          checked ? "bg-[#EE10B0]" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function StatChip({ icon: Icon, label, count, to }) {
  const inner = (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition hover:border-[#EE10B0]/30 hover:bg-[#EE10B0]/5">
      <Icon className="text-lg text-[#EE10B0]" />
      <div>
        <p className="text-xl font-semibold text-white">{count}</p>
        <p className="text-xs text-white/45">{label}</p>
      </div>
    </div>
  );
  if (to) {
    return (
      <Link to={to} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function Settings() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuth, token, username: tokenUsername, email: tokenEmail, role } =
    getToken();
  const { likes, savedAlbums, savedGenres, savedPlaylists } = useLibrary();

  const [prefs, setPrefs] = useState(getAllPreferences);
  const [volume, setVolume] = useState(getPlayerVolume);
  const [locale, setLocale] = useState(getStoredLocale);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [editUsername, setEditUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarRemoving, setAvatarRemoving] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState(false);

  const displayName = profile?.username || tokenUsername || t("settings.account.guest");
  const displayEmail = profile?.email || tokenEmail || "—";

  const reloadPrefs = useCallback(() => {
    setPrefs(getAllPreferences());
    setVolume(getPlayerVolume());
    setLocale(getStoredLocale());
  }, []);

  useEffect(() => {
    window.addEventListener(PREFS_CHANGE_EVENT, reloadPrefs);
    return () => window.removeEventListener(PREFS_CHANGE_EVENT, reloadPrefs);
  }, [reloadPrefs]);

  useEffect(() => {
    if (!isAuth || !token) return;
    let cancelled = false;
    setProfileLoading(true);
    fetchMe(token)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuth, token]);

  useEffect(() => {
    if (!editUsername || !/^[a-zA-Z0-9_]{3,20}$/.test(newUsername.trim())) {
      setUsernameAvailable(null);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const result = await checkUsername(newUsername.trim());
        setUsernameAvailable(result.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [newUsername, editUsername]);

  const updatePref = (key, value) => {
    setPreference(key, value);
    setPrefs((p) => ({ ...p, [key]: value }));
    if (key === "reduceMotion") {
      document.documentElement.classList.toggle("reduce-motion", value);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", prefs.reduceMotion);
  }, [prefs.reduceMotion]);

  const handleVolumeChange = (v) => {
    const val = v / 100;
    setVolume(val);
    setPlayerVolume(val);
  };

  const handleLocale = async (code) => {
    await changeAppLanguage(code);
    setLocale(code);
  };

  const handleSaveUsername = async () => {
    if (!token || usernameAvailable !== true) return;
    setUsernameSaving(true);
    setUsernameError("");
    try {
      await setUsername({ token, username: newUsername.trim() });
      setProfile((p) => ({ ...p, username: newUsername.trim() }));
      setUsernameSuccess(true);
      setEditUsername(false);
      setTimeout(() => setUsernameSuccess(false), 3000);
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : t("settings.account.usernameError"));
    } finally {
      setUsernameSaving(false);
    }
  };

  const handleAvatarSelect = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !token) return;

    setAvatarError("");
    setAvatarSuccess(false);

    let dataUrl;
    try {
      dataUrl = await fileToAvatarDataUrl(file);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "too_large") {
        setAvatarError(t("settings.account.avatarTooLarge"));
      } else if (code === "unsupported_type") {
        setAvatarError(t("settings.account.avatarInvalidType"));
      } else {
        setAvatarError(t("settings.account.avatarError"));
      }
      return;
    }

    setAvatarUploading(true);
    try {
      const updated = await uploadAvatar({ token, avatarData: dataUrl });
      setProfile(updated);
      dispatchProfileChange();
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3000);
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : t("settings.account.avatarError"));
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!token || !profile?.avatarUrl) return;
    setAvatarError("");
    setAvatarSuccess(false);
    setAvatarRemoving(true);
    try {
      const updated = await removeAvatar(token);
      setProfile(updated);
      dispatchProfileChange();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : t("settings.account.avatarError"));
    } finally {
      setAvatarRemoving(false);
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/Home");
  };

  const handleResetPrefs = () => {
    resetPreferences();
    setPlayerVolume(1);
    setVolume(1);
    setPrefs(getAllPreferences());
  };

  const handleClearLocal = () => {
    clearLocalAppData({ keepLocale: true });
    clearAuthSession();
    navigate("/login");
  };

  const repeatOptions = useMemo(
    () => [
      { id: "off", label: t("settings.playback.repeatOff") },
      { id: "all", label: t("settings.playback.repeatAll") },
      { id: "one", label: t("settings.playback.repeatOne") },
    ],
    [t],
  );

  if (!isAuth) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EE10B0]/10 text-2xl text-[#EE10B0]">
          <UserOutlined />
        </div>
        <h1 className="text-2xl font-bold text-white">{t("settings.guest.title")}</h1>
        <p className="mt-3 text-white/45">{t("settings.guest.subtitle")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="rounded-full bg-[#EE10B0] px-8 py-3 text-sm font-semibold text-white hover:bg-[#cb0094] cursor-pointer"
          >
            {t("common.login")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="rounded-full border border-white/15 px-8 py-3 text-sm font-semibold text-white/80 hover:text-white cursor-pointer"
          >
            {t("common.signUp")}
          </button>
        </div>
        <div className="mt-8">
        <SettingsSection
          icon={GlobalOutlined}
          title={t("settings.language.title")}
          description={t("settings.language.subtitle")}
        >
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleLocale(code)}
                className={`rounded-full px-4 py-2 text-sm transition cursor-pointer ${
                  locale === code
                    ? "bg-[#EE10B0]/20 text-[#EE10B0] border border-[#EE10B0]/40"
                    : "border border-white/10 text-white/60 hover:text-white"
                }`}
              >
                {t(LOCALE_LABELS[code])}
              </button>
            ))}
          </div>
        </SettingsSection>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 pb-32 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mb-8"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[#EE10B0]/80">
          {t("common.settings")}
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {t("settings.title")}
        </h1>
        <p className="mt-2 text-white/45">{t("settings.subtitle")}</p>
      </motion.div>

      <div className="space-y-6">

        <SettingsSection
          icon={UserOutlined}
          title={t("settings.account.title")}
          description={t("settings.account.subtitle")}
        >
          <div className="flex items-center gap-4">
            <label className="group relative shrink-0 cursor-pointer">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-[#EE10B0]/30"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#EE10B0] to-[#0E9EEF] text-2xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition group-hover:opacity-100">
                {avatarUploading ? (
                  <LoadingOutlined className="text-xl text-white" />
                ) : (
                  <CameraOutlined className="text-xl text-white" />
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={avatarUploading || avatarRemoving}
                onChange={handleAvatarSelect}
              />
            </label>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-white">
                {profileLoading ? "…" : displayName}
              </p>
              <p className="flex items-center gap-1.5 truncate text-sm text-white/45">
                <MailOutlined className="shrink-0" />
                {displayEmail}
              </p>
              {role && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#EE10B0]/30 bg-[#EE10B0]/10 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[#EE10B0]">
                  {role === "admin" && <CrownOutlined />}
                  {role}
                </span>
              )}
            </div>
          </div>

          {profile?.avatarUrl && (
            <button
              type="button"
              onClick={handleAvatarRemove}
              disabled={avatarUploading || avatarRemoving}
              className="text-xs text-red-400/80 hover:text-red-300 disabled:opacity-50 cursor-pointer"
            >
              {avatarRemoving ? "…" : t("settings.account.avatarRemove")}
            </button>
          )}
          {avatarSuccess && (
            <p className="text-xs text-emerald-400">{t("settings.account.avatarSaved")}</p>
          )}
          {avatarError && <p className="text-xs text-red-400">{avatarError}</p>}

          {!editUsername ? (
            <button
              type="button"
              onClick={() => {
                setEditUsername(true);
                setNewUsername(displayName !== t("settings.account.guest") ? displayName : "");
                setUsernameError("");
              }}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 transition hover:border-[#EE10B0]/40 hover:text-white cursor-pointer"
            >
              {t("settings.account.changeUsername")}
            </button>
          ) : (
            <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <label className="block text-xs font-medium uppercase tracking-wider text-white/35">
                {t("auth.username.label")}
              </label>
              <input
                value={newUsername}
                onChange={(e) =>
                  setNewUsername(e.target.value.replace(/\s/g, "").toLowerCase())
                }
                className="w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-white outline-none focus:border-[#EE10B0]/50"
                placeholder="username"
              />
              {checkingUsername && (
                <p className="text-xs text-white/40">{t("auth.register.checkingUsername")}</p>
              )}
              {!checkingUsername && usernameAvailable === true && (
                <p className="text-xs text-emerald-400">{t("auth.username.available")}</p>
              )}
              {!checkingUsername && usernameAvailable === false && (
                <p className="text-xs text-red-400">{t("auth.username.taken")}</p>
              )}
              {usernameError && (
                <p className="text-xs text-red-300">{usernameError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={usernameAvailable !== true || usernameSaving}
                  onClick={handleSaveUsername}
                  className="rounded-full bg-[#EE10B0] px-5 py-2 text-sm font-semibold text-white disabled:opacity-40 cursor-pointer"
                >
                  {usernameSaving ? t("auth.username.saving") : t("common.save")}
                </button>
                <button
                  type="button"
                  onClick={() => setEditUsername(false)}
                  className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/60 cursor-pointer"
                >
                  {t("common.back")}
                </button>
              </div>
            </div>
          )}

          {usernameSuccess && (
            <p className="flex items-center gap-2 text-sm text-emerald-400">
              <CheckOutlined /> {t("settings.account.usernameSaved")}
            </p>
          )}
        </SettingsSection>


        <SettingsSection
          icon={DatabaseOutlined}
          title={t("settings.library.title")}
          description={t("settings.library.subtitle")}
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatChip
              icon={HeartOutlined}
              label={t("nav.likedSongs")}
              count={likes.length}
              to="/LikedSongs"
            />
            <StatChip
              icon={StarOutlined}
              label={t("nav.savedAlbums")}
              count={savedAlbums.length}
              to="/SavedAlbums"
            />
            <StatChip
              icon={AppstoreOutlined}
              label={t("nav.savedGenres")}
              count={savedGenres.length}
              to="/SavedGenres"
            />
            <StatChip
              icon={UnorderedListOutlined}
              label={t("nav.savedPlaylists")}
              count={savedPlaylists.length}
              to="/SavedPlaylists"
            />
          </div>
        </SettingsSection>


        <SettingsSection
          icon={GlobalOutlined}
          title={t("settings.language.title")}
          description={t("settings.language.subtitle")}
        >
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => handleLocale(code)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm transition cursor-pointer ${
                  locale === code
                    ? "bg-[#EE10B0]/20 text-[#EE10B0] border border-[#EE10B0]/40"
                    : "border border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                }`}
              >
                {locale === code && <CheckOutlined className="text-xs" />}
                {t(LOCALE_LABELS[code])}
              </button>
            ))}
          </div>
        </SettingsSection>


        <SettingsSection
          icon={CustomerServiceOutlined}
          title={t("settings.playback.title")}
          description={t("settings.playback.subtitle")}
        >
          <ToggleRow
            label={t("settings.playback.autoplay")}
            hint={t("settings.playback.autoplayHint")}
            checked={prefs.autoplayNext}
            onChange={(v) => updatePref("autoplayNext", v)}
          />
          <ToggleRow
            label={t("settings.playback.crossfade")}
            hint={t("settings.playback.crossfadeHint")}
            checked={prefs.crossfadeEnabled}
            onChange={(v) => updatePref("crossfadeEnabled", v)}
          />

          <div>
            <p className="mb-2 text-sm font-medium text-white/90">
              {t("settings.playback.repeat")}
            </p>
            <div className="flex flex-wrap gap-2">
              {repeatOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => updatePref("repeatMode", opt.id)}
                  className={`rounded-full px-4 py-2 text-sm transition cursor-pointer ${
                    prefs.repeatMode === opt.id
                      ? "bg-[#EE10B0]/20 text-[#EE10B0] border border-[#EE10B0]/40"
                      : "border border-white/10 text-white/60 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-white/90">
                {t("settings.playback.volume")}
              </p>
              <span className="text-xs text-white/40">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-full accent-[#EE10B0] cursor-pointer"
            />
          </div>
        </SettingsSection>


        <SettingsSection
          icon={BgColorsOutlined}
          title={t("settings.appearance.title")}
          description={t("settings.appearance.subtitle")}
        >
          <ToggleRow
            label={t("settings.appearance.reduceMotion")}
            hint={t("settings.appearance.reduceMotionHint")}
            checked={prefs.reduceMotion}
            onChange={(v) => updatePref("reduceMotion", v)}
          />
          <ToggleRow
            label={t("settings.appearance.headerNews")}
            hint={t("settings.appearance.headerNewsHint")}
            checked={prefs.showHeaderNews}
            onChange={(v) => updatePref("showHeaderNews", v)}
          />
        </SettingsSection>


        <SettingsSection
          icon={InfoCircleOutlined}
          title={t("settings.about.title")}
          description={t("settings.about.subtitle")}
        >
          <p className="text-sm text-white/50">
            {t("settings.about.version")}: <span className="text-white/80">{APP_VERSION}</span>
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { to: "/about", label: t("common.about") },
              { to: "/premium", label: t("common.premium") },
              { to: "/contact", label: t("common.contact") },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:border-[#EE10B0]/30 hover:text-[#EE10B0]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </SettingsSection>


        <SettingsSection
          icon={SafetyOutlined}
          title={t("settings.danger.title")}
          description={t("settings.danger.subtitle")}
        >
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleResetPrefs}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/20 hover:text-white cursor-pointer"
            >
              {t("settings.danger.resetPrefs")}
              <DeleteOutlined />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-left text-sm text-white/70 transition hover:border-amber-500/30 hover:text-amber-200 cursor-pointer"
            >
              {t("settings.danger.logout")}
              <LogoutOutlined />
            </button>
            <button
              type="button"
              onClick={handleClearLocal}
              className="flex w-full items-center justify-between rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-left text-sm text-red-300 transition hover:bg-red-500/10 cursor-pointer"
            >
              {t("settings.danger.clearLocal")}
              <DeleteOutlined />
            </button>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}
