export function BloomMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <defs>
        <linearGradient id="bloom-mark" x1="0" y1="0" x2="32" y2="32">
          <stop stopColor="#EE10B0" />
          <stop offset="1" stopColor="#0E9EEF" />
        </linearGradient>
      </defs>
      <g stroke="url(#bloom-mark)" strokeWidth="1.8" strokeLinecap="round">
        <path d="M7 20c0-5 4-9 9-9s9 4 9 9" opacity="0.5" />
        <path d="M11 21c0-2.8 2.2-5 5-5s5 2.2 5 5" opacity="0.85" />
        <line x1="16" y1="14" x2="16" y2="24" />
        <line x1="12" y1="17" x2="12" y2="22" />
        <line x1="20" y1="17" x2="20" y2="22" />
      </g>
    </svg>
  );
}
