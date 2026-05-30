import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import { checkUsername, setUsername } from "../../api/authApi";
import { saveAuthSession } from "../../utils/authSession";

const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

export default function ChooseUsername() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [username, setUsernameValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const pendingToken = sessionStorage.getItem("pendingToken");

  useEffect(() => {
    if (!pendingToken) {
      navigate("/login");
    }
  }, [pendingToken, navigate]);

  const usernameError = useMemo(() => {
    if (!submitted && !username) return "";
    if (!username.trim()) return t("auth.validation.usernameRequired");
    if (!usernamePattern.test(username.trim())) {
      return t("auth.validation.usernameFormat");
    }
    if (usernameAvailable === false) return t("auth.username.taken");
    return "";
  }, [username, submitted, usernameAvailable, t]);

  const canSubmit =
    usernamePattern.test(username.trim()) &&
    usernameAvailable === true &&
    !checkingUsername &&
    !loading &&
    Boolean(pendingToken);

  useEffect(() => {
    if (!usernamePattern.test(username.trim())) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const result = await checkUsername(username.trim());
        setUsernameAvailable(result.available);
      } catch {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit || !pendingToken) return;

    setLoading(true);
    setError("");

    try {
      const data = await setUsername({
        token: pendingToken,
        username: username.trim(),
      });

      sessionStorage.removeItem("pendingToken");
      saveAuthSession({ token: data.token || pendingToken });
      navigate("/Home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save username.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.username.title")}
      subtitle={t("auth.username.subtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <AuthInput
          id="choose-username"
          label={t("auth.username.label")}
          value={username}
          onChange={(e) =>
            setUsernameValue(e.target.value.replace(/\s/g, "").toLowerCase())
          }
          autoComplete="username"
          error={usernameError}
        />

        {checkingUsername && (
          <p className="px-1 text-xs text-white/40">{t("auth.register.checkingUsername")}</p>
        )}

        {!checkingUsername && usernameAvailable === true && username.trim() && (
          <p className="px-1 text-xs text-emerald-400">{t("auth.username.available")}</p>
        )}

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={!canSubmit}
          whileHover={canSubmit ? { scale: 1.01 } : undefined}
          whileTap={canSubmit ? { scale: 0.99 } : undefined}
          className={`mt-2 w-full rounded-full py-3.5 text-[15px] font-semibold transition-all duration-200 sm:py-4 ${
            canSubmit
              ? "bg-[#cb0094] text-white shadow-[0_10px_28px_rgba(203,0,148,0.35)] hover:bg-[#EE10B0]"
              : "cursor-not-allowed bg-white/10 text-white/30"
          }`}
        >
          {loading ? t("auth.username.saving") : t("auth.register.activateAccount")}
        </motion.button>
      </form>
    </AuthLayout>
  );
}
