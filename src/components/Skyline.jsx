export default function Skyline({ style }) {
  return (
    <svg
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      style={style}
    >
      <defs>
        <radialGradient id="sunGlow" cx="68%" cy="55%" r="45%">
          <stop offset="0%" stopColor="#C9A876" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C9A876" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="1440" height="320" fill="url(#sunGlow)" />

      {/* Background low-rise skyline */}
      <g fill="#2D3B4E" opacity="0.55">
        <rect x="0" y="230" width="60" height="90" />
        <rect x="70" y="200" width="45" height="120" />
        <rect x="125" y="245" width="70" height="75" />
        <rect x="1080" y="210" width="55" height="110" />
        <rect x="1150" y="240" width="60" height="80" />
        <rect x="1230" y="190" width="50" height="130" />
        <rect x="1300" y="225" width="65" height="95" />
        <rect x="1380" y="205" width="60" height="115" />
      </g>

      {/* Mid skyline */}
      <g fill="#2D3B4E" opacity="0.8">
        <rect x="150" y="150" width="60" height="170" />
        <rect x="220" y="120" width="50" height="200" />
        <polygon points="290,320 290,140 320,110 350,140 350,320" />
        <rect x="900" y="130" width="55" height="190" />
        <rect x="965" y="170" width="70" height="150" />
        <rect x="1040" y="100" width="45" height="220" />
      </g>

      {/* Burj Khalifa - tapering signature spire, dead center */}
      <g fill="#0B1120">
        <polygon points="700,320 700,90 712,40 724,90 724,320" />
        <polygon points="706,90 712,10 718,90" />
        <rect x="710" y="0" width="4" height="12" />
      </g>

      {/* Supporting towers flanking the spire */}
      <g fill="#0B1120">
        <polygon points="560,320 560,160 590,120 620,160 620,320" />
        <rect x="630" y="180" width="40" height="140" />
        <rect x="760" y="150" width="42" height="170" />
        <polygon points="810,320 810,170 835,135 860,170 860,320" />
      </g>
    </svg>
  )
}
