import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import { login } from "../../api/authApi";
import { saveAuthSession } from "../../utils/authSession";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailError = useMemo(() => {
    if (!submitted && !email) return "";
    if (!email.trim()) return t("auth.validation.emailRequired");
    if (!emailPattern.test(email.trim())) return t("auth.validation.emailInvalid");
    return "";
  }, [email, submitted, t]);

  const passwordError = useMemo(() => {
    if (!submitted && !password) return "";
    if (!password) return t("auth.validation.passwordRequired");
    if (password.length < 6) return t("auth.validation.passwordMin");
    return "";
  }, [password, submitted, t]);

  const canSubmit =
    emailPattern.test(email.trim()) && password.length >= 6 && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    try {
      const data = await login({ email: email.trim(), password });

      const authToken = data.token ?? data.Token;

      if (data.mustChangePassword) {
        saveAuthSession({ token: authToken });
        navigate("/change-password");
        return;
      }

      if (data.needsUsername) {
        sessionStorage.setItem("pendingToken", authToken);
        navigate("/choose-username");
        return;
      }

      saveAuthSession({ token: authToken });
      navigate("/Home");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("auth.login.error")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <AuthInput
          id="login-email"
          label={t("common.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          error={emailError}
        />

        <AuthInput
          id="login-password"
          label={t("common.password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          error={passwordError}
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
          {loading ? t("auth.login.signingIn") : t("common.continue")}
        </motion.button>
      </form>

      <p className="mt-8 text-center text-sm text-white/45">
        {t("auth.login.noAccount")}{" "}
        <Link
          to="/register"
          className="font-medium text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-[#cb0094]"
        >
          {t("common.register")}
        </Link>
      </p>
    </AuthLayout>
  );
}
