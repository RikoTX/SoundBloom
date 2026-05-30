import { useState } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

export default function AuthInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const floated = focused || Boolean(value);

  return (
    <div className="relative">
      <motion.div
        animate={{
          borderColor: error
            ? "rgba(239,68,68,0.6)"
            : focused
              ? "rgba(203,0,148,0.55)"
              : "rgba(255,255,255,0.1)",
          boxShadow: focused
            ? "0 0 0 3px rgba(203,0,148,0.12), 0 8px 24px rgba(0,0,0,0.25)"
            : "0 0 0 0px transparent",
        }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden rounded-xl border bg-[#18181B]/80 backdrop-blur-sm sm:rounded-2xl"
      >
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-4 transition-all duration-200 ${
            floated
              ? "top-2 text-[11px] text-[#EE10B0]"
              : "top-1/2 -translate-y-1/2 text-sm text-white/40"
          }`}
        >
          {label}
        </label>

        <input
          id={id}
          type={inputType}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full bg-transparent px-4 text-[15px] text-white outline-none ${
            isPassword ? "pr-11" : ""
          } ${floated ? "pb-2.5 pt-6 sm:pb-3 sm:pt-7" : "py-3.5 sm:py-4"}`}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white/70"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </button>
        )}
      </motion.div>

      {error && (
        <p className="mt-1.5 px-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
