export default function PulseMark({ size = 28, animate = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="16" fill="var(--card-bg)" stroke="var(--accent)" strokeWidth="1.5" />
      <path
        d="M6 34 L20 34 L25 20 L32 46 L38 28 L42 34 L58 34"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animate ? 'pulse-trace' : undefined}
      />
    </svg>
  )
}
