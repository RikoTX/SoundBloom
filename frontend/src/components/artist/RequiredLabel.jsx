export default function RequiredLabel({ children, required = true }) {
  return (
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-white/40">
      {children}
      {required && <span className="ml-0.5 text-[#EE10B0]">*</span>}
    </label>
  );
}

export function FieldInput({ className = "", ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-white outline-none focus:border-[#EE10B0]/50 ${className}`}
      {...props}
    />
  );
}

export function FieldSelect({ className = "", children, ...props }) {
  return (
    <select
      className={`w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-white outline-none focus:border-[#EE10B0]/50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function FieldTextarea({ className = "", rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full rounded-xl border border-white/10 bg-[#09090B] px-4 py-2.5 text-sm text-white outline-none focus:border-[#EE10B0]/50 resize-y min-h-[100px] ${className}`}
      {...props}
    />
  );
}
