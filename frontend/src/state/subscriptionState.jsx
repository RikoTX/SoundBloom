import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchSubscriptionStatus,
  recordTrackSkip,
} from "../api/subscriptionApi";
import { getToken } from "../utils/getToken";
import { notifyError } from "../utils/appNotification";

const SubscriptionContext = createContext(null);

const FREE_DEFAULT = {
  plan: "free",
  isActive: false,
  canCancel: false,
  skipsToday: 0,
  skipsLimit: 3,
  skipsRemaining: 3,
  unlimitedSkips: false,
  noAds: false,
  canDownload: false,
  losslessAudio: false,
  exclusiveMixes: false,
  familySlots: 0,
  configured: true,
};

export function SubscriptionProvider({ children }) {
  const [status, setStatus] = useState(FREE_DEFAULT);
  const [loading, setLoading] = useState(false);
  const [playerAd, setPlayerAd] = useState(null);
  const afterAdRef = useRef(null);

  const refresh = useCallback(async () => {
    const { isAuth } = getToken();
    if (!isAuth) {
      setStatus(FREE_DEFAULT);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchSubscriptionStatus();
      setStatus({
        plan: data.plan ?? "free",
        isActive: Boolean(data.isActive),
        canCancel: Boolean(
          data.canCancel ?? (data.plan === "premium" || data.plan === "family"),
        ),
        expiresAt: data.expiresAt,
        skipsToday: data.skipsToday ?? 0,
        skipsLimit: data.skipsLimit ?? 3,
        skipsRemaining: data.skipsRemaining ?? 0,
        unlimitedSkips: Boolean(data.unlimitedSkips),
        noAds: Boolean(data.noAds),
        canDownload: Boolean(data.canDownload),
        losslessAudio: Boolean(data.losslessAudio),
        exclusiveMixes: Boolean(data.exclusiveMixes),
        familySlots: data.familySlots ?? 0,
        configured: true,
      });
    } catch (err) {
      setStatus({
        ...FREE_DEFAULT,
        configured: false,
      });
      console.warn("[subscription]", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onAuth = () => refresh();
    const onSubscriptionChange = () => refresh();
    window.addEventListener("soundbloom-auth-change", onAuth);
    window.addEventListener("soundbloom-subscription-change", onSubscriptionChange);
    return () => {
      window.removeEventListener("soundbloom-auth-change", onAuth);
      window.removeEventListener("soundbloom-subscription-change", onSubscriptionChange);
    };
  }, [refresh]);

  const finishPlayerAd = useCallback(() => {
    setPlayerAd(null);
    const fn = afterAdRef.current;
    afterAdRef.current = null;
    fn?.();
  }, []);

  const runSkipGated = useCallback(
    async (action) => {
      const { isAuth } = getToken();
      if (!isAuth) {
        action();
        return;
      }

      if (status.unlimitedSkips) {
        action();
        return;
      }

      try {
        const result = await recordTrackSkip();
        await refresh();

        if (result.showAd && result.ad) {
          afterAdRef.current = action;
          setPlayerAd(result.ad);
          return;
        }

        action();
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Не удалось проверить лимит пропусков.";
        notifyError("Подписка", msg);
        throw err;
      }
    },
    [status.unlimitedSkips, refresh],
  );

  const value = useMemo(
    () => ({
      status,
      loading,
      refresh,
      runSkipGated,
      playerAd,
      finishPlayerAd,
    }),
    [status, loading, refresh, runSkipGated, playerAd, finishPlayerAd],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return ctx;
}
