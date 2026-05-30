import { useState } from "react";
import { motion } from "framer-motion";

export default function ContactField({
  id,
  label,
  type = "text",
  value,
  onChange,
  multiline = false,
  rows = 5,
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || Boolean(value);
  const Tag = multiline ? "textarea" : "input";

  return (
    <div className="relative">
      <motion.div
        animate={{
          borderColor: focused
            ? "rgba(203,0,148,0.55)"
            : "rgba(255,255,255,0.1)",
          boxShadow: focused
            ? "0 0 0 3px rgba(203,0,148,0.12), 0 8px 24px rgba(0,0,0,0.25)"
            : "0 0 0 0px transparent",
        }}
        transition={{ duration: 0.2 }}
        className="relative overflow-hidden rounded-xl border bg-[#18181B]/60 backdrop-blur-md sm:rounded-2xl"
      >
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-4 transition-all duration-200 ${
            floated
              ? "top-2 text-[11px] text-[#EE10B0]"
              : multiline
                ? "top-5 text-sm text-white/40"
                : "top-1/2 -translate-y-1/2 text-sm text-white/40"
          }`}
        >
          {label}
        </label>

        <Tag
          id={id}
          type={multiline ? undefined : type}
          rows={multiline ? rows : undefined}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full resize-none bg-transparent px-4 text-[15px] text-white outline-none ${
            multiline
              ? floated
                ? "pb-3 pt-7"
                : "py-5"
              : floated
                ? "pb-2.5 pt-6 sm:pb-3 sm:pt-7"
                : "py-3.5 sm:py-4"
          }`}
        />
      </motion.div>
    </div>
  );
}
