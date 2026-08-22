function ScallopShell({ className, color, delay = "0s" }) {
  return (
    <svg viewBox="0 0 100 90" className={className} style={{ animationDelay: delay }} fill="none">
      <path
        d="M50 5C50 5 20 25 12 55C8 68 15 82 28 85C35 87 42 82 50 82C58 82 65 87 72 85C85 82 92 68 88 55C80 25 50 5 50 5Z"
        fill={color}
      />
      <path d="M50 5V82" stroke="white" strokeWidth="1.5" opacity="0.35" />
      <path d="M50 10C46 30 40 55 30 78" stroke="white" strokeWidth="1.2" opacity="0.3" />
      <path d="M50 10C54 30 60 55 70 78" stroke="white" strokeWidth="1.2" opacity="0.3" />
      <path d="M50 10C44 32 38 58 22 68" stroke="white" strokeWidth="1" opacity="0.25" />
      <path d="M50 10C56 32 62 58 78 68" stroke="white" strokeWidth="1" opacity="0.25" />
    </svg>
  );
}

export default function FloatingDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <ScallopShell className="absolute top-20 left-[4%] w-12 h-11 md:w-16 md:h-14 animate-float opacity-80" color="var(--color-coral)" />
      <ScallopShell className="absolute top-52 right-[10%] w-8 h-7 md:w-11 md:h-10 animate-float-slow opacity-70" color="var(--color-ocean-light)" delay="1.5s" />
      <ScallopShell className="absolute bottom-32 left-[8%] w-10 h-9 md:w-14 md:h-12 animate-float opacity-60" color="var(--color-seafoam)" delay="2.5s" />
      <ScallopShell className="absolute bottom-16 right-[6%] w-9 h-8 md:w-13 md:h-11 animate-float-slow opacity-70" color="var(--color-shell)" delay="0.8s" />

      <svg className="absolute top-36 right-[20%] w-6 h-6 md:w-8 md:h-8 animate-float opacity-50" viewBox="0 0 24 24" style={{ animationDelay: "3s" }}>
        <circle cx="12" cy="12" r="9" fill="var(--color-ocean-light)" />
      </svg>
      <svg className="absolute bottom-48 left-[22%] w-5 h-5 md:w-7 md:h-7 animate-float-slow opacity-40" viewBox="0 0 24 24" style={{ animationDelay: "1.2s" }}>
        <circle cx="12" cy="12" r="9" fill="var(--color-coral)" />
      </svg>
    </div>
  );
}