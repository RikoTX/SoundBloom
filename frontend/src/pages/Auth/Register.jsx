import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import {
  checkUsername,
  register,
  resendCode,
  setUsername,
  verifyEmail,
} from "../../api/authApi";
import { saveAuthSession } from "../../utils/authSession";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [step, setStep] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsernameValue] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  useEffect(() => {
    if (location.state?.reason === "playback") {
      setInfo(t("auth.register.listenGate"));
    }
  }, [location.state, t]);

  const emailError = useMemo(() => {
    if (step !== "register" || (!submitted && !email)) return "";
    if (!email.trim()) return t("auth.validation.emailRequired");
    if (!emailPattern.test(email.trim())) return t("auth.validation.emailInvalid");
    return "";
  }, [email, submitted, step, t]);

  const passwordError = useMemo(() => {
    if (step !== "register" || (!submitted && !password)) return "";
    if (!password) return t("auth.validation.passwordRequired");
    if (password.length < 6) return t("auth.validation.passwordMin");
    return "";
  }, [password, submitted, step, t]);

  const confirmError = useMemo(() => {
    if (step !== "register" || (!submitted && !confirmPassword)) return "";
    if (!confirmPassword) return t("auth.validation.confirmPassword");
    if (confirmPassword !== password) return t("auth.validation.passwordMismatch");
    return "";
  }, [confirmPassword, password, submitted, step, t]);

  const codeError = useMemo(() => {
    if (step !== "verify" || (!submitted && !code)) return "";
    if (!code.trim()) return t("auth.validation.codeRequired");
    if (code.trim().length < 4) return t("auth.validation.codeShort");
    return "";
  }, [code, submitted, step, t]);

  const usernameError = useMemo(() => {
    if (step !== "username" || (!submitted && !username)) return "";
    if (!username.trim()) return t("auth.validation.usernameRequired");
    if (!usernamePattern.test(username.trim())) {
      return t("auth.validation.usernameFormat");
    }
    if (usernameAvailable === false) return t("auth.username.taken");
    return "";
  }, [username, submitted, step, usernameAvailable, t]);

  const canSubmitRegister =
    emailPattern.test(email.trim()) &&
    password.length >= 6 &&
    confirmPassword === password &&
    termsAccepted &&
    !loading;

  const canSubmitVerify = code.trim().length >= 4 && !loading;

  const canSubmitUsername =
    usernamePattern.test(username.trim()) &&
    usernameAvailable === true &&
    !checkingUsername &&
    !loading;

  useEffect(() => {
    if (step !== "username" || !usernamePattern.test(username.trim())) {
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
  }, [username, step]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmitRegister) return;

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const data = await register({ email: email.trim(), password });
      setInfo(data.message || t("auth.verify.codeSent"));
      setStep("verify");
      setSubmitted(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("auth.register.error"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmitVerify) return;

    setLoading(true);
    setError("");
    setInfo("");

    try {
      const data = await verifyEmail({ email: email.trim(), code: code.trim() });
      setPendingToken(data.token);

      if (data.needsUsername) {
        setStep("username");
        setSubmitted(false);
        return;
      }

      saveAuthSession({ token: data.token });
      navigate("/Home");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const data = await resendCode({ email: email.trim() });
      setInfo(data.message || "Verification code sent again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code.");
    } finally {
      setLoading(false);
    }
  };

  const handleUsername = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmitUsername || !pendingToken) return;

    setLoading(true);
    setError("");

    try {
      const data = await setUsername({
        token: pendingToken,
        username: username.trim(),
      });

      saveAuthSession({ token: data.token || pendingToken });
      navigate("/Home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save username.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <AuthLayout
        title={t("auth.verify.title")}
        subtitle={t("auth.verify.subtitle", { email })}
      >
        <p className="mb-2 px-1 text-xs leading-relaxed text-white/40">
          The code looks like{" "}
          <span className="text-white/60">123456</span>. If you only received a
          link, ask the project owner to add{" "}
          <code className="text-white/55">{`{{ .Token }}`}</code> to the Supabase
          Confirm sign-up email template, then tap Resend code.
        </p>
        <form onSubmit={handleVerify} className="space-y-4 sm:space-y-5">
          <AuthInput
            id="verify-code"
            label={t("auth.verify.code")}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
            autoComplete="one-time-code"
            error={codeError}
          />

          {info && (
            <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {info}
            </p>
          )}

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={!canSubmitVerify}
            whileHover={canSubmitVerify ? { scale: 1.01 } : undefined}
            whileTap={canSubmitVerify ? { scale: 0.99 } : undefined}
            className={`mt-2 w-full rounded-full py-3.5 text-[15px] font-semibold transition-all duration-200 sm:py-4 ${
              canSubmitVerify
                ? "bg-[#cb0094] text-white shadow-[0_10px_28px_rgba(203,0,148,0.35)] hover:bg-[#EE10B0]"
                : "cursor-not-allowed bg-white/10 text-white/30"
            }`}
          >
            {loading ? t("auth.verify.verifying") : t("auth.verify.confirm")}
          </motion.button>

          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="w-full text-sm text-white/50 transition hover:text-white"
          >
            {t("auth.verify.resend")}
          </button>
        </form>
      </AuthLayout>
    );
  }

  if (step === "username") {
    return (
      <AuthLayout
        title={t("auth.username.title")}
        subtitle={t("auth.username.subtitle")}
      >
        <form onSubmit={handleUsername} className="space-y-4 sm:space-y-5">
          <AuthInput
            id="register-username"
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
            disabled={!canSubmitUsername}
            whileHover={canSubmitUsername ? { scale: 1.01 } : undefined}
            whileTap={canSubmitUsername ? { scale: 0.99 } : undefined}
            className={`mt-2 w-full rounded-full py-3.5 text-[15px] font-semibold transition-all duration-200 sm:py-4 ${
              canSubmitUsername
                ? "bg-[#cb0094] text-white shadow-[0_10px_28px_rgba(203,0,148,0.35)] hover:bg-[#EE10B0]"
                : "cursor-not-allowed bg-white/10 text-white/30"
            }`}
          >
            {loading ? t("auth.username.saving") : t("auth.username.finish")}
          </motion.button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t("auth.register.title")}
      subtitle={t("auth.register.subtitle")}
    >
      <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
        <AuthInput
          id="register-email"
          label={t("common.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          error={emailError}
        />

        <AuthInput
          id="register-password"
          label={t("common.password")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          error={passwordError}
        />

        <AuthInput
          id="register-confirm"
          label={t("auth.register.confirmPassword")}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          error={confirmError}
        />

        <label className="flex cursor-pointer items-start gap-3 px-1 pt-1">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 accent-[#cb0094]"
          />
          <span className="text-sm leading-relaxed text-white/50">
            <Trans
              i18nKey="auth.register.agreeTerms"
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
          </span>
        </label>

        {info && (
          <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {info}
          </p>
        )}

        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={!canSubmitRegister}
          whileHover={canSubmitRegister ? { scale: 1.01 } : undefined}
          whileTap={canSubmitRegister ? { scale: 0.99 } : undefined}
          className={`mt-2 w-full rounded-full py-3.5 text-[15px] font-semibold transition-all duration-200 sm:py-4 ${
            canSubmitRegister
              ? "bg-[#cb0094] text-white shadow-[0_10px_28px_rgba(203,0,148,0.35)] hover:bg-[#EE10B0]"
              : "cursor-not-allowed bg-white/10 text-white/30"
          }`}
        >
          {loading ? t("auth.register.creating") : t("auth.register.createAccount")}
        </motion.button>
      </form>

      <p className="mt-8 text-center text-sm text-white/45">
        {t("auth.register.hasAccount")}{" "}
        <Link
          to="/login"
          className="font-medium text-white underline decoration-white/30 underline-offset-4 transition hover:decoration-[#cb0094]"
        >
          {t("common.login")}
        </Link>
      </p>
    </AuthLayout>
  );
}
