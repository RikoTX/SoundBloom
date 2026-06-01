import { useEffect, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CameraOutlined, LoadingOutlined } from "@ant-design/icons";
import { registerArtist } from "../../api/artistApi";
import { fetchMe } from "../../api/authApi";
import { getToken } from "../../utils/getToken";
import { fileToAvatarDataUrl } from "../../utils/avatarImage";
import {
  PRO_SOCIETIES,
  MUSIC_GENRES,
  COUNTRIES,
  CAREER_YEARS,
} from "../../constants/artistStudio";
import RequiredLabel, {
  FieldInput,
  FieldSelect,
  FieldTextarea,
} from "./RequiredLabel";

export default function ArtistRegistrationWizard({ onComplete }) {
  const { t } = useTranslation();
  const { token } = getToken();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: "",
    genre: "",
    country: "",
    city: "",
    proSociety: "",
    termsAccepted: false,
    description: "",
    imageUrl: null,
    facebook: "",
    spotify: "",
    twitter: "",
    careerStartYear: new Date().getFullYear(),
  });

  useEffect(() => {
    if (!token) return;
    fetchMe(token)
      .then((p) => {
        if (p?.avatarUrl) setProfileAvatar(p.avatarUrl);
      })
      .catch(() => {});
  }, [token]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const step1Valid =
    form.name.trim() &&
    form.genre &&
    form.country &&
    form.city.trim() &&
    form.proSociety &&
    form.termsAccepted;

  const step2Valid = form.description.trim().length >= 10 && form.careerStartYear;

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    setError("");
    try {
      const dataUrl = await fileToAvatarDataUrl(file, 512);
      set("imageUrl", dataUrl);
    } catch {
      setError(t("artist.register.imageError"));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFinish = async () => {
    if (!step2Valid) return;
    setSaving(true);
    setError("");
    try {
      const imageUrl = form.imageUrl || profileAvatar || null;
      await registerArtist({
        name: form.name.trim(),
        genre: form.genre,
        country: form.country,
        city: form.city.trim(),
        proSociety: form.proSociety,
        termsAccepted: true,
        description: form.description.trim(),
        imageUrl,
        facebook: form.facebook.trim() || null,
        spotify: form.spotify.trim() || null,
        twitter: form.twitter.trim() || null,
        careerStartYear: Number(form.careerStartYear),
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("artist.error"));
    } finally {
      setSaving(false);
    }
  };

  const previewImage = form.imageUrl || profileAvatar;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-[#111113] p-6 sm:p-8"
    >
      <div className="mb-6 flex gap-2">
        {[1, 2].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition ${
              step >= n ? "bg-[#EE10B0]" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <>
          <h2 className="text-2xl font-bold text-white mb-1">
            {t("artist.register.step1Title")}
          </h2>
          <p className="text-sm text-white/45 mb-6">{t("artist.register.step1Subtitle")}</p>

          <div className="space-y-4">
            <div>
              <RequiredLabel>{t("artist.register.name")}</RequiredLabel>
              <FieldInput
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={t("artist.register.namePlaceholder")}
              />
            </div>
            <div>
              <RequiredLabel>{t("artist.register.genre")}</RequiredLabel>
              <FieldSelect value={form.genre} onChange={(e) => set("genre", e.target.value)}>
                <option value="">{t("artist.register.selectOption")}</option>
                {MUSIC_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </FieldSelect>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <RequiredLabel>{t("artist.register.country")}</RequiredLabel>
                <FieldSelect
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                >
                  <option value="">{t("artist.register.selectOption")}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </FieldSelect>
              </div>
              <div>
                <RequiredLabel>{t("artist.register.city")}</RequiredLabel>
                <FieldInput
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
            </div>
            <div>
              <RequiredLabel>{t("artist.register.pro")}</RequiredLabel>
              <FieldSelect
                value={form.proSociety}
                onChange={(e) => set("proSociety", e.target.value)}
              >
                <option value="">{t("artist.register.selectOption")}</option>
                {PRO_SOCIETIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </FieldSelect>
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) => set("termsAccepted", e.target.checked)}
                className="mt-1 accent-[#EE10B0]"
              />
              <span className="text-sm text-white/70">
                <Trans
                  i18nKey="artist.register.terms"
                  components={{
                    link: (
                      <Link
                        to="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#EE10B0] hover:underline font-medium"
                      />
                    ),
                  }}
                />
                <span className="text-[#EE10B0]">*</span>
              </span>
            </label>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
              className="rounded-full bg-[#EE10B0] px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-40 cursor-pointer hover:bg-[#cb0094] transition"
            >
              {t("artist.register.next")} →
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="text-2xl font-bold text-white mb-1">
            {t("artist.register.step2Title")}
          </h2>
          <p className="text-sm text-white/45 mb-6">{t("artist.register.step2Subtitle")}</p>

          <div className="space-y-5">
            <div>
              <RequiredLabel>{t("artist.register.description")}</RequiredLabel>
              <FieldTextarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
              />
            </div>

            <div>
              <RequiredLabel required={false}>
                {t("artist.register.photo")}
              </RequiredLabel>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:border-[#EE10B0]/40 hover:text-white transition">
                {uploadingImage ? <LoadingOutlined /> : <CameraOutlined />}
                {t("artist.register.chooseFile")}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleImage}
                />
              </label>
              {previewImage && (
                <div className="mt-4 flex items-center gap-4">
                  <img
                    src={previewImage}
                    alt=""
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-[#EE10B0]/30"
                  />
                  <p className="text-xs text-white/45">{t("artist.register.currentImage")}</p>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
              <p className="text-sm font-semibold text-white">
                {t("artist.register.socialTitle")}
              </p>
              <div>
                <RequiredLabel required={false}>Facebook</RequiredLabel>
                <FieldInput
                  value={form.facebook}
                  onChange={(e) => set("facebook", e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div>
                <RequiredLabel required={false}>Spotify</RequiredLabel>
                <FieldInput
                  value={form.spotify}
                  onChange={(e) => set("spotify", e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div>
                <RequiredLabel required={false}>Twitter</RequiredLabel>
                <FieldInput
                  value={form.twitter}
                  onChange={(e) => set("twitter", e.target.value)}
                  placeholder="https://"
                />
              </div>
              <div>
                <RequiredLabel>{t("artist.register.careerStart")}</RequiredLabel>
                <FieldSelect
                  value={form.careerStartYear}
                  onChange={(e) => set("careerStartYear", e.target.value)}
                >
                  {CAREER_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </FieldSelect>
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <div className="mt-8 flex flex-wrap gap-3 justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-full border border-white/10 px-6 py-2.5 text-sm text-white/60 hover:text-white cursor-pointer"
            >
              ← {t("artist.register.back")}
            </button>
            <button
              type="button"
              disabled={!step2Valid || saving}
              onClick={handleFinish}
              className="rounded-full bg-[#EE10B0] px-8 py-2.5 text-sm font-semibold text-white disabled:opacity-40 cursor-pointer hover:bg-[#cb0094] transition"
            >
              {saving ? "…" : t("artist.register.finish")}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
