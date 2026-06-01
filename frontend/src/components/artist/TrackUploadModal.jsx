import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CloseOutlined,
  LoadingOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { createArtistTrack } from "../../api/artistApi";
import {
  PRO_SOCIETIES,
  TRACK_GENRES,
  TRACK_MOODS,
  TRACK_INSTRUMENTS,
  TEMPO_OPTIONS,
  ENERGY_OPTIONS,
  MOOD_OPTIONS,
  LYRICS_LANGUAGES,
} from "../../constants/artistStudio";
import { readAudioFile, readCoverFile } from "../../utils/mediaFiles";
import RequiredLabel, {
  FieldInput,
  FieldSelect,
  FieldTextarea,
} from "./RequiredLabel";

const STEPS = 7;

const initialForm = () => ({
  title: "",
  releaseDate: "",
  proCode: "",
  proRelated: false,
  proMembership: "",
  audioData: null,
  audioFormat: "",
  audioName: "",
  isInstrumental: false,
  lyricsText: "",
  language: "",
  explicitLanguage: false,
  vocalType: "male",
  coverData: null,
  authors: "",
  description: "",
  genreTags: [],
  instrumentTags: [],
  electricAcoustic: "electric",
  tempo: "",
  energy: "",
  mood: "",
  commercialUse: false,
  allowDerivatives: "no",
});

function TagPicker({ label, options, selected, max, onChange, required }) {
  const toggle = (tag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
      return;
    }
    if (selected.length >= max) return;
    onChange([...selected, tag]);
  };

  return (
    <div>
      <RequiredLabel required={required}>{label}</RequiredLabel>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`rounded-full px-3 py-1 text-xs border transition cursor-pointer ${
                active
                  ? "border-[#EE10B0] bg-[#EE10B0]/15 text-[#EE10B0]"
                  : "border-white/10 text-white/55 hover:border-white/25"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackUploadModal({ artistProSociety, onClose, onSaved }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const allTags = useMemo(
    () => [...form.genreTags, ...form.instrumentTags],
    [form.genreTags, form.instrumentTags],
  );

  const canNext = () => {
    switch (step) {
      case 1:
        return (
          form.title.trim() &&
          form.releaseDate &&
          form.audioData &&
          (!form.proRelated || form.proMembership)
        );
      case 2:
        return form.isInstrumental || (form.lyricsText.trim() && form.language);
      case 3:
        return Boolean(form.coverData);
      case 4:
        return form.authors.trim().length > 0;
      case 5:
        return true;
      case 6:
        return allTags.length >= 1 && form.tempo && form.energy && form.mood;
      case 7:
        return Boolean(form.allowDerivatives);
      default:
        return false;
    }
  };

  const handleAudio = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLoadingFile(true);
    setError("");
    try {
      const { dataUrl, format, name } = await readAudioFile(file);
      set("audioData", dataUrl);
      set("audioFormat", format);
      set("audioName", name);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "audio_too_large") setError(t("artist.upload.audioTooLarge"));
      else setError(t("artist.upload.audioInvalid"));
    } finally {
      setLoadingFile(false);
    }
  };

  const handleCover = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setLoadingFile(true);
    setError("");
    try {
      const dataUrl = await readCoverFile(file);
      set("coverData", dataUrl);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      if (code === "cover_too_large") setError(t("artist.upload.coverTooLarge"));
      else setError(t("artist.upload.coverInvalid"));
    } finally {
      setLoadingFile(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      await createArtistTrack({
        title: form.title.trim(),
        releaseDate: form.releaseDate,
        proCode: form.proCode.trim() || null,
        proRelated: form.proRelated,
        proMembership: form.proRelated ? form.proMembership : null,
        audioData: form.audioData,
        audioFormat: form.audioFormat,
        isInstrumental: form.isInstrumental,
        lyricsText: form.lyricsText,
        language: form.language,
        explicitLanguage: form.explicitLanguage,
        vocalType: form.vocalType,
        coverData: form.coverData,
        authors: form.authors.trim(),
        description: form.description.trim() || null,
        tags: allTags,
        electricAcoustic: form.electricAcoustic,
        tempo: form.tempo,
        energy: form.energy,
        mood: form.mood,
        commercialUse: form.commercialUse,
        allowDerivatives: form.allowDerivatives,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("artist.error"));
    } finally {
      setSaving(false);
    }
  };

  const stepTitles = [
    t("artist.upload.step1"),
    t("artist.upload.step2"),
    t("artist.upload.step3"),
    t("artist.upload.step4"),
    t("artist.upload.step5"),
    t("artist.upload.step6"),
    t("artist.upload.step7"),
  ];

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/75 p-0 sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-2xl sm:rounded-2xl border border-white/10 bg-[#111113] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-white">{t("artist.upload.title")}</h2>
            <p className="text-xs text-white/40">
              {stepTitles[step - 1]} · {step}/{STEPS}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white cursor-pointer p-1"
          >
            <CloseOutlined />
          </button>
        </div>

        <div className="flex gap-1 px-5 pt-3 shrink-0">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full ${step > i ? "bg-[#EE10B0]" : "bg-white/10"}`}
            />
          ))}
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">
          {step === 1 && (
            <>
              <div>
                <RequiredLabel>{t("artist.upload.trackTitle")}</RequiredLabel>
                <FieldInput
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>
              <div>
                <RequiredLabel>{t("artist.upload.releaseDate")}</RequiredLabel>
                <FieldInput
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => set("releaseDate", e.target.value)}
                />
              </div>
              <div>
                <RequiredLabel required={false}>
                  {t("artist.upload.proCode")}
                </RequiredLabel>
                <FieldInput
                  value={form.proCode}
                  onChange={(e) => set("proCode", e.target.value)}
                />
              </div>
              <div>
                <RequiredLabel>{t("artist.upload.proRelatedQ")}</RequiredLabel>
                <div className="flex gap-6 mt-2">
                  {[
                    [true, t("common.yes")],
                    [false, t("common.no")],
                  ].map(([val, label]) => (
                    <label key={String(val)} className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                      <input
                        type="radio"
                        name="proRelated"
                        checked={form.proRelated === val}
                        onChange={() => set("proRelated", val)}
                        className="accent-[#EE10B0]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              {form.proRelated && (
                <div>
                  <RequiredLabel>{t("artist.upload.proMembership")}</RequiredLabel>
                  <FieldSelect
                    value={form.proMembership}
                    onChange={(e) => set("proMembership", e.target.value)}
                  >
                    <option value="">{t("artist.register.selectOption")}</option>
                    {(artistProSociety
                      ? [artistProSociety, ...PRO_SOCIETIES.filter((p) => p !== artistProSociety)]
                      : PRO_SOCIETIES
                    ).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </FieldSelect>
                  <p className="mt-2 text-xs text-white/35">{t("artist.upload.proHint")}</p>
                </div>
              )}
              <div>
                <RequiredLabel>{t("artist.upload.audioFile")}</RequiredLabel>
                <p className="text-xs text-white/35 mb-2">{t("artist.upload.audioHint")}</p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm text-white/60 hover:border-[#EE10B0]/40 transition w-full justify-center">
                  {loadingFile ? <LoadingOutlined /> : <UploadOutlined />}
                  {form.audioName || t("artist.upload.chooseAudio")}
                  <input
                    type="file"
                    accept="audio/mpeg,audio/wav,audio/flac,.mp3,.wav,.flac"
                    className="sr-only"
                    onChange={handleAudio}
                  />
                </label>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <RequiredLabel>{t("artist.upload.vocalType")}</RequiredLabel>
              <div className="flex flex-wrap gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                  <input
                    type="radio"
                    checked={form.isInstrumental}
                    onChange={() => set("isInstrumental", true)}
                    className="accent-[#EE10B0]"
                  />
                  {t("artist.upload.instrumental")}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                  <input
                    type="radio"
                    checked={!form.isInstrumental}
                    onChange={() => set("isInstrumental", false)}
                    className="accent-[#EE10B0]"
                  />
                  {t("artist.upload.vocal")}
                </label>
              </div>
              {!form.isInstrumental && (
                <>
                  <div>
                    <RequiredLabel>{t("artist.upload.lyrics")}</RequiredLabel>
                    <FieldTextarea
                      value={form.lyricsText}
                      onChange={(e) => set("lyricsText", e.target.value)}
                      rows={6}
                    />
                  </div>
                  <div>
                    <RequiredLabel>{t("artist.upload.language")}</RequiredLabel>
                    <FieldSelect
                      value={form.language}
                      onChange={(e) => set("language", e.target.value)}
                    >
                      <option value="">{t("artist.register.selectOption")}</option>
                      {LYRICS_LANGUAGES.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </FieldSelect>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={form.explicitLanguage}
                      onChange={(e) => set("explicitLanguage", e.target.checked)}
                      className="accent-[#EE10B0]"
                    />
                    {t("artist.upload.explicit")}
                  </label>
                  <div>
                    <RequiredLabel>{t("artist.upload.vocalGender")}</RequiredLabel>
                    <div className="flex gap-6 mt-2">
                      {["male", "female"].map((v) => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                          <input
                            type="radio"
                            name="vocalType"
                            checked={form.vocalType === v}
                            onChange={() => set("vocalType", v)}
                            className="accent-[#EE10B0]"
                          />
                          {t(v === "male" ? "artist.upload.male" : "artist.upload.female")}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {step === 3 && (
            <>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200/90">
                {t("artist.upload.coverWarning")}
              </div>
              <label className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/15 py-10 cursor-pointer hover:border-[#EE10B0]/40 transition">
                {loadingFile ? (
                  <LoadingOutlined className="text-2xl text-[#EE10B0]" />
                ) : form.coverData ? (
                  <img
                    src={form.coverData}
                    alt=""
                    className="h-48 w-48 rounded-lg object-cover shadow-lg ring-2 ring-[#EE10B0]/30"
                  />
                ) : (
                  <>
                    <UploadOutlined className="text-3xl text-white/30" />
                    <span className="text-sm text-white/50">
                      {t("artist.upload.uploadCover")}
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="sr-only"
                  onChange={handleCover}
                />
              </label>
            </>
          )}

          {step === 4 && (
            <div>
              <RequiredLabel>{t("artist.upload.authors")}</RequiredLabel>
              <FieldInput
                value={form.authors}
                onChange={(e) => set("authors", e.target.value)}
                placeholder={t("artist.upload.authorsPlaceholder")}
              />
            </div>
          )}

          {step === 5 && (
            <div>
              <RequiredLabel required={false}>{t("artist.upload.description")}</RequiredLabel>
              <FieldTextarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={t("artist.upload.descriptionPlaceholder")}
                rows={6}
              />
            </div>
          )}

          {step === 6 && (
            <>
              <p className="text-sm text-white/45">{t("artist.upload.tagsHint")}</p>
              <TagPicker
                label={t("artist.upload.genres")}
                options={TRACK_GENRES}
                selected={form.genreTags}
                max={2}
                onChange={(v) => set("genreTags", v)}
                required
              />
              <TagPicker
                label={t("artist.upload.instruments")}
                options={[...TRACK_INSTRUMENTS, ...TRACK_MOODS]}
                selected={form.instrumentTags}
                max={2}
                onChange={(v) => set("instrumentTags", v)}
                required={false}
              />
              <div>
                <RequiredLabel>{t("artist.upload.electricAcoustic")}</RequiredLabel>
                <div className="flex gap-6 mt-2">
                  {["electric", "acoustic"].map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                      <input
                        type="radio"
                        checked={form.electricAcoustic === v}
                        onChange={() => set("electricAcoustic", v)}
                        className="accent-[#EE10B0]"
                      />
                      {t(v === "electric" ? "artist.upload.electric" : "artist.upload.acoustic")}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <RequiredLabel>{t("artist.upload.tempo")}</RequiredLabel>
                  <FieldSelect value={form.tempo} onChange={(e) => set("tempo", e.target.value)}>
                    <option value="">{t("artist.register.selectOption")}</option>
                    {TEMPO_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </FieldSelect>
                </div>
                <div>
                  <RequiredLabel>{t("artist.upload.energy")}</RequiredLabel>
                  <FieldSelect value={form.energy} onChange={(e) => set("energy", e.target.value)}>
                    <option value="">{t("artist.register.selectOption")}</option>
                    {ENERGY_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </FieldSelect>
                </div>
                <div>
                  <RequiredLabel>{t("artist.upload.moodField")}</RequiredLabel>
                  <FieldSelect value={form.mood} onChange={(e) => set("mood", e.target.value)}>
                    <option value="">{t("artist.register.selectOption")}</option>
                    {MOOD_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </FieldSelect>
                </div>
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <div>
                <RequiredLabel>{t("artist.upload.commercial")}</RequiredLabel>
                <div className="flex gap-6 mt-2">
                  {[
                    [true, t("common.yes")],
                    [false, t("common.no")],
                  ].map(([val, label]) => (
                    <label key={String(val)} className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                      <input
                        type="radio"
                        checked={form.commercialUse === val}
                        onChange={() => set("commercialUse", val)}
                        className="accent-[#EE10B0]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <RequiredLabel>{t("artist.upload.derivatives")}</RequiredLabel>
                <div className="space-y-2 mt-2">
                  {[
                    ["yes", t("artist.upload.derivYes")],
                    ["share_alike", t("artist.upload.derivShareAlike")],
                    ["no", t("artist.upload.derivNo")],
                  ].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer text-sm text-white/80">
                      <input
                        type="radio"
                        name="derivatives"
                        checked={form.allowDerivatives === val}
                        onChange={() => set("allowDerivatives", val)}
                        className="accent-[#EE10B0]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="flex flex-wrap gap-3 justify-between border-t border-white/[0.06] px-5 py-4 shrink-0">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/60 hover:text-white cursor-pointer"
          >
            {step > 1 ? `← ${t("artist.register.back")}` : t("common.cancel")}
          </button>
          {step < STEPS ? (
            <button
              type="button"
              disabled={!canNext()}
              onClick={() => {
                setError("");
                setStep(step + 1);
              }}
              className="rounded-full bg-[#EE10B0] px-6 py-2 text-sm font-semibold text-white disabled:opacity-40 cursor-pointer"
            >
              {t("artist.register.next")} →
            </button>
          ) : (
            <button
              type="button"
              disabled={!canNext() || saving}
              onClick={handleSubmit}
              className="rounded-full bg-[#EE10B0] px-6 py-2 text-sm font-semibold text-white disabled:opacity-40 cursor-pointer"
            >
              {saving ? "…" : t("artist.upload.submit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
