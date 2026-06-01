import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import { changePassword } from "../../api/authApi";
import { getToken } from "../../utils/getToken";
import { saveAuthSession } from "../../utils/authSession";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { token, isAuth } = getToken();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordError = useMemo(() => {
    if (!submitted && !password) return "";
    if (password.length < 8) return t("auth.changePassword.minLength");
    return "";
  }, [password, submitted, t]);

  const confirmError = useMemo(() => {
    if (!submitted && !confirm) return "";
    if (password !== confirm) return t("auth.changePassword.mismatch");
    return "";
  }, [confirm, password, submitted, t]);

  const canSubmit =
    isAuth &&
    Boolean(token) &&
    password.length >= 8 &&
    password === confirm &&
    !loading;

  if (!isAuth || !token) {
    navigate("/login", { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const data = await changePassword({
        token,
        newPassword: password,
        confirmPassword: confirm,
      });

      if (data.needsUsername) {
        sessionStorage.setItem("pendingToken", data.token ?? data.Token);
        navigate("/choose-username");
        return;
      }

      saveAuthSession({ token: data.token ?? data.Token });
      navigate("/Home");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.changePassword.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.changePassword.title")}
      subtitle={t("auth.changePassword.subtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <AuthInput
          id="new-password"
          label={t("auth.changePassword.newPassword")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          error={passwordError}
        />

        <AuthInput
          id="confirm-password"
          label={t("auth.changePassword.confirmPassword")}
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          error={confirmError}
        />

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
          {loading ? t("auth.changePassword.saving") : t("auth.changePassword.submit")}
        </motion.button>
      </form>
    </AuthLayout>
  );
}
