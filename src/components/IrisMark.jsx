// IrisMark — gestileerde spectrum-glyph (kopie van horaizon-brain).
// Volledige spectrum-cirkel met radiale gradient, geclipt op een
// kleinere lens zodat het lijkt op een iris/regenboog-oog.
export default function IrisMark({ size = 32 }) {
  const id = `iris-mark-${size}`
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-grad`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#EE6A3A" />
          <stop offset="14%" stopColor="#E0B341" />
          <stop offset="28%" stopColor="#5DBF92" />
          <stop offset="43%" stopColor="#4FB8B2" />
          <stop offset="57%" stopColor="#4A6FD6" />
          <stop offset="71%" stopColor="#6B3FE4" />
          <stop offset="85%" stopColor="#C03F7B" />
          <stop offset="100%" stopColor="#E58FA8" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="32" cy="32" r="22" />
        </clipPath>
      </defs>
      <circle cx="32" cy="32" r="22" fill={`url(#${id}-grad)`} />
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx="32" cy="30" r="9" fill="none" stroke="#fff" strokeWidth="3.4" />
        <rect x="11" y="34" width="42" height="3.4" fill="#fff" />
      </g>
    </svg>
  )
}
