import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GiftOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { getToken } from "../../utils/getToken";
import {
  fetchAdminPromos,
  createAdminPromo,
  updateAdminPromo,
  deleteAdminPromo,
} from "../../api/promoApi";
import { confirmAction, notifyError, notifySuccess } from "../../utils/appNotification";

const DISCOUNT_TYPES = [
  { value: "percent", label: "Процент (%)" },
  { value: "fixed", label: "Фикс. сумма (₸)" },
  { value: "free_months", label: "Бесплатные месяцы" },
];

const SCOPES = [
  { value: "all", label: "Все тарифы" },
  { value: "premium", label: "Только Premium" },
  { value: "family", label: "Только Family" },
];

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "percent",
  discountValue: "10",
  appliesTo: "all",
  maxRedemptions: "",
  expiresAt: "",
};

function describeDiscount(p) {
  if (p.discountType === "percent") return `−${p.discountValue}%`;
  if (p.discountType === "fixed") return `−${p.discountValue} ₸`;
  if (p.discountType === "free_months") return `+${p.discountValue} мес.`;
  return p.discountValue;
}

function fmtDate(value) {
  if (!value) return "∞ бессрочно";
  try {
    return new Date(value).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

export default function PromoCodes() {
  const navigate = useNavigate();
  const { isAdmin } = getToken();

  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isAdmin) navigate("/Home", { replace: true });
  }, [isAdmin, navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchAdminPromos();
      setPromos(Array.isArray(list) ? list : []);
    } catch (err) {
      notifyError("Промокоды", err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const setField = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    const value = Number(form.discountValue);
    if (!form.code.trim()) {
      notifyError("Промокоды", "Введите код");
      return;
    }
    if (!Number.isFinite(value) || value <= 0) {
      notifyError("Промокоды", "Введите корректное значение скидки");
      return;
    }

    setSaving(true);
    try {
      await createAdminPromo({
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue: value,
        appliesTo: form.appliesTo,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      });
      notifySuccess("Промокоды", "Промокод создан");
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      notifyError("Промокоды", err instanceof Error ? err.message : "Не удалось создать");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (promo) => {
    try {
      await updateAdminPromo(promo.id, { isActive: !promo.isActive });
      setPromos((list) =>
        list.map((p) => (p.id === promo.id ? { ...p, isActive: !p.isActive } : p)),
      );
    } catch (err) {
      notifyError("Промокоды", err instanceof Error ? err.message : "Ошибка");
    }
  };

  const remove = async (promo) => {
    const confirmed = await confirmAction({
      title: `Удалить промокод ${promo.code}?`,
      okText: "Удалить",
      cancelText: "Отмена",
      danger: true,
    });
    if (!confirmed) return;
    try {
      await deleteAdminPromo(promo.id);
      setPromos((list) => list.filter((p) => p.id !== promo.id));
      notifySuccess("Промокоды", "Удалено");
    } catch (err) {
      notifyError("Промокоды", err instanceof Error ? err.message : "Ошибка");
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 pb-32 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-white/45 hover:text-white cursor-pointer"
        >
          <ArrowLeftOutlined /> В админ-панель
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EE10B0]/15 text-xl text-[#EE10B0]">
            <GiftOutlined />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Промокоды</h1>
            <p className="text-white/45">Скидки и бонусы на подписки Premium и Family</p>
          </div>
        </div>
      </motion.div>

      <form
        onSubmit={handleCreate}
        className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-white/[0.08] bg-[#111113] p-5 sm:grid-cols-2 sm:p-6"
      >
        <div className="sm:col-span-2">
          <h2 className="mb-2 text-lg font-semibold text-white">Новый промокод</h2>
        </div>

        <Field label="Код">
          <input
            value={form.code}
            onChange={(e) => setField("code", e.target.value.toUpperCase())}
            placeholder="SUMMER25"
            maxLength={32}
            className="promo-input"
          />
        </Field>

        <Field label="Описание (необязательно)">
          <input
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Летняя акция"
            className="promo-input"
          />
        </Field>

        <Field label="Тип скидки">
          <select
            value={form.discountType}
            onChange={(e) => setField("discountType", e.target.value)}
            className="promo-input"
          >
            {DISCOUNT_TYPES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={
            form.discountType === "free_months"
              ? "Кол-во месяцев"
              : form.discountType === "percent"
                ? "Процент скидки"
                : "Сумма скидки (₸)"
          }
        >
          <input
            type="number"
            min="1"
            value={form.discountValue}
            onChange={(e) => setField("discountValue", e.target.value)}
            className="promo-input"
          />
        </Field>

        <Field label="Применяется к">
          <select
            value={form.appliesTo}
            onChange={(e) => setField("appliesTo", e.target.value)}
            className="promo-input"
          >
            {SCOPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Лимит активаций (пусто = ∞)">
          <input
            type="number"
            min="1"
            value={form.maxRedemptions}
            onChange={(e) => setField("maxRedemptions", e.target.value)}
            placeholder="∞"
            className="promo-input"
          />
        </Field>

        <Field label="Действует до (пусто = бессрочно)">
          <input
            type="date"
            value={form.expiresAt}
            onChange={(e) => setField("expiresAt", e.target.value)}
            className="promo-input"
          />
        </Field>

        <div className="flex items-end sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#EE10B0] px-5 py-2.5 font-medium text-white transition hover:bg-[#d10e9d] disabled:opacity-50"
          >
            {saving ? <LoadingOutlined /> : <PlusOutlined />}
            Создать промокод
          </button>
        </div>
      </form>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Активные и архивные ({promos.length})
        </h2>
        <button
          type="button"
          onClick={load}
          className="inline-flex items-center gap-2 text-sm text-white/55 hover:text-white"
        >
          <ReloadOutlined /> Обновить
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111113]">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-white/40">
            <LoadingOutlined style={{ fontSize: 24 }} />
          </div>
        ) : promos.length === 0 ? (
          <div className="py-16 text-center text-white/40">Промокодов пока нет</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/[0.08] text-xs uppercase tracking-wider text-white/35">
              <tr>
                <th className="px-4 py-3">Код</th>
                <th className="px-4 py-3">Скидка</th>
                <th className="px-4 py-3">Тариф</th>
                <th className="px-4 py-3">Активаций</th>
                <th className="px-4 py-3">До</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-mono font-semibold text-white">{p.code}</div>
                    {p.description && (
                      <div className="text-xs text-white/40">{p.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#EE10B0]">{describeDiscount(p)}</td>
                  <td className="px-4 py-3 text-white/70">
                    {SCOPES.find((s) => s.value === p.appliesTo)?.label ?? p.appliesTo}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {p.redeemedCount}
                    {p.maxRedemptions ? ` / ${p.maxRedemptions}` : " / ∞"}
                  </td>
                  <td className="px-4 py-3 text-white/70">{fmtDate(p.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(p)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        p.isActive
                          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                          : "bg-white/10 text-white/50 hover:bg-white/20"
                      }`}
                    >
                      {p.isActive ? "Активен" : "Выключен"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(p)}
                      className="text-white/40 transition hover:text-red-500"
                      aria-label="Удалить"
                    >
                      <DeleteOutlined />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .promo-input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: #0c0c0e;
          color: #fff;
          padding: 10px 12px;
          font-size: 14px;
          outline: none;
        }
        .promo-input:focus { border-color: #EE10B0; }
        .promo-input option { background: #111113; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-wider text-white/35">
        {label}
      </span>
      {children}
    </label>
  );
}
