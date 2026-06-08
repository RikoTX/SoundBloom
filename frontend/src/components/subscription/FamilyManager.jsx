import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  UserOutlined,
  UsergroupAddOutlined,
  DeleteOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  fetchFamily,
  addFamilyMember,
  removeFamilyMember,
  searchFamilyUsers,
} from "../../api/subscriptionApi";
import { notifyError, notifySuccess } from "../../utils/appNotification";
import { resolveMediaUrl } from "../../utils/resolveMediaUrl";

export default function FamilyManager() {
  const { t } = useTranslation();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchFamily();
      setInfo(data);
    } catch {
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const term = username.trim();
    if (term.length < 1) {
      setSuggestions([]);
      return undefined;
    }
    let active = true;
    const handle = setTimeout(async () => {
      try {
        const list = await searchFamilyUsers(term);
        if (active) setSuggestions(Array.isArray(list) ? list : []);
      } catch {
        if (active) setSuggestions([]);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [username]);

  const addByName = async (name) => {
    const value = (name || "").trim();
    if (!value || adding) return;
    setAdding(true);
    setShowSuggestions(false);
    try {
      await addFamilyMember(value);
      notifySuccess(t("settings.family.error"), t("settings.family.addSuccess"));
      setUsername("");
      setSuggestions([]);
      await load();
    } catch (err) {
      notifyError(
        t("settings.family.error"),
        err instanceof Error ? err.message : t("settings.family.error"),
      );
    } finally {
      setAdding(false);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    addByName(username);
  };

  const handleRemove = async (memberId) => {
    setRemovingId(memberId);
    try {
      await removeFamilyMember(memberId);
      notifySuccess(t("settings.family.error"), t("settings.family.removeSuccess"));
      setInfo((prev) =>
        prev
          ? {
              ...prev,
              used: Math.max(0, (prev.used ?? 1) - 1),
              members: (prev.members ?? []).filter((m) => m.userId !== memberId),
            }
          : prev,
      );
    } catch (err) {
      notifyError(
        t("settings.family.error"),
        err instanceof Error ? err.message : t("settings.family.error"),
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-white/40">
        <LoadingOutlined /> ...
      </div>
    );
  }

  if (!info) return null;

  // Member of someone else's family
  if (!info.isOwner && info.isMember) {
    return (
      <div className="mt-3 rounded-xl border border-[#0E9EEF]/25 bg-[#0E9EEF]/10 p-4">
        <p className="flex items-center gap-2 text-sm text-[#7cc7f5]">
          <UsergroupAddOutlined />
          {t("settings.family.managedBy", { owner: info.managedByUsername })}
        </p>
      </div>
    );
  }

  if (!info.isOwner) return null;

  const members = info.members ?? [];
  const full = (info.used ?? members.length) >= (info.slots ?? 6);
  const memberIds = new Set(members.map((m) => m.userId));
  const filteredSuggestions = suggestions.filter(
    (u) => !memberIds.has(u.userId),
  );

  return (
    <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EE10B0]/15 text-[#EE10B0]">
            <UsergroupAddOutlined />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">
              {t("settings.family.title")}
            </p>
            <p className="text-xs text-white/40">
              {t("settings.family.subtitle", { slots: info.slots ?? 6 })}
            </p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
          {t("settings.family.slots", {
            used: info.used ?? members.length,
            slots: info.slots ?? 6,
          })}
        </span>
      </div>

      <form onSubmit={handleAdd} className="mb-3 flex gap-2">
        <div className="flex flex-1 items-center rounded-lg border border-white/10 bg-[#0c0c0e] px-3">
          <span className="text-white/30">@</span>
          <input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={t("settings.family.addPlaceholder")}
            disabled={full}
            autoComplete="off"
            className="w-full bg-transparent px-1.5 py-2 text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={adding || full || !username.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#EE10B0] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#cb0094] disabled:opacity-40"
        >
          {adding ? <LoadingOutlined /> : <PlusOutlined />}
          {adding ? t("settings.family.adding") : t("settings.family.add")}
        </button>
      </form>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="mt-2 max-h-60 overflow-auto rounded-lg border border-white/10 bg-[#141416] py-1">
          {filteredSuggestions.map((u) => (
            <li key={u.userId}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => addByName(u.username)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-white/[0.06]"
              >
                {u.avatarUrl ? (
                  <img
                    src={resolveMediaUrl(u.avatarUrl)}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/50">
                    <UserOutlined />
                  </span>
                )}
                <span className="truncate text-sm text-white/85">
                  @{u.username}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {members.length === 0 ? (
        <p className="py-3 text-center text-sm text-white/35">
          {t("settings.family.empty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {members.map((m) => (
            <li
              key={m.userId}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                {m.avatarUrl ? (
                  <img
                    src={resolveMediaUrl(m.avatarUrl)}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/50">
                    <UserOutlined />
                  </span>
                )}
                <span className="truncate text-sm text-white/85">
                  @{m.username}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(m.userId)}
                disabled={removingId === m.userId}
                className="inline-flex items-center gap-1 text-xs text-white/40 transition hover:text-red-400 disabled:opacity-40"
              >
                {removingId === m.userId ? <LoadingOutlined /> : <DeleteOutlined />}
                {t("settings.family.remove")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
