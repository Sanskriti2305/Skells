export default function ShellIcon({ open = true, className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none">
      <path
        d="M12 3C7 3 3 8 3 14c0 1.5 1 2 2 1.5 1-3 2.5-4.5 3.5-2 .5 1.5 1 1 1.5-0.5 1-2.5 2.5-2.5 3.5 0 .7 1.7 1.2 2 1.7.5 1-3.5 2.5-2 3.5 2 1 0.5 2-0 2-1.5C21 8 17 3 12 3Z"
        fill={open ? "var(--color-seafoam)" : "var(--color-terracotta)"}
        opacity={open ? 1 : 0.6}
      />
      <path d="M12 3v10" stroke="white" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}