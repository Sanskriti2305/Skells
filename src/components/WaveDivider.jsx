export default function WaveDivider({ flip = false, color = "var(--color-ocean)" }) {
  return (
    <div className={flip ? "rotate-180" : ""}>
      <svg viewBox="0 0 1440 80" className="w-full h-12 md:h-16" preserveAspectRatio="none">
        <path
          d="M0,40 C240,90 480,0 720,30 C960,60 1200,10 1440,40 L1440,80 L0,80 Z"
          fill={color}
          opacity="0.15"
        />
        <path
          d="M0,55 C240,20 480,80 720,50 C960,20 1200,70 1440,45 L1440,80 L0,80 Z"
          fill={color}
          opacity="0.3"
        />
      </svg>
    </div>
  );
}