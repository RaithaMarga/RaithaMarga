import './AgriBackdrop.css';

/**
 * An original, hand-authored SVG illustration — not a photograph.
 * There's no licensed agricultural photography available to embed here,
 * and generating a photorealistic image isn't something this
 * environment can do. This gets the warm, rural, trustworthy feeling
 * the brief asks for using layered vector fields instead: soft sun
 * glow, distant tree line, and curved crop-row bands echoing the
 * road-through-fields motif in the RaithaMarga logo.
 *
 * Zero network cost (inline SVG, no image request), so it can't be
 * the reason the site feels slow. Motion is confined to a slow,
 * decorative drift on the crop-row bands and respects
 * prefers-reduced-motion via CSS.
 */
const AgriBackdrop = ({ variant = 'hero' }) => {
  return (
    <div className={`agri-backdrop agri-backdrop--${variant}`} aria-hidden="true">
      <svg
        className="agri-backdrop__svg"
        viewBox="0 0 1440 640"
        preserveAspectRatio="xMidYMax slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="agriSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="55%" stopColor="#FBF3DE" />
            <stop offset="100%" stopColor="#F2E4BE" />
          </linearGradient>
          <radialGradient id="agriSun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F7CB63" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F7CB63" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="agriHillFar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CFE0C6" />
            <stop offset="100%" stopColor="#AFC79E" />
          </linearGradient>
          <linearGradient id="agriHillMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8FAE72" />
            <stop offset="100%" stopColor="#6E9450" />
          </linearGradient>
          <linearGradient id="agriRow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F7A38" />
            <stop offset="100%" stopColor="#3B5F29" />
          </linearGradient>
        </defs>

        <rect width="1440" height="640" fill="url(#agriSky)" />
        <circle className="agri-backdrop__sun" cx="1180" cy="120" r="160" fill="url(#agriSun)" />

        {/* Distant tree line */}
        <g className="agri-backdrop__trees" opacity="0.55" fill="#7C9A63">
          {[80, 150, 230, 310, 990, 1080, 1170, 1260, 1340].map((x, i) => (
            <ellipse key={x} cx={x} cy={330 - (i % 3) * 6} rx={26 + (i % 3) * 4} ry={34 + (i % 3) * 5} />
          ))}
        </g>

        {/* Far rolling hill */}
        <path
          d="M0,360 C220,300 420,340 640,320 C860,300 1080,340 1440,300 L1440,640 L0,640 Z"
          fill="url(#agriHillFar)"
        />

        {/* Mid hill */}
        <path
          d="M0,420 C260,380 480,430 720,405 C960,380 1180,430 1440,395 L1440,640 L0,640 Z"
          fill="url(#agriHillMid)"
        />

        {/* Crop-row bands, echoing the road-through-fields in the logo */}
        <g className="agri-backdrop__rows">
          <path
            className="agri-backdrop__row agri-backdrop__row--1"
            d="M-100,520 C260,470 520,560 900,500 C1120,465 1300,510 1540,470 L1540,640 L-100,640 Z"
            fill="url(#agriRow)"
            opacity="0.85"
          />
          <path
            className="agri-backdrop__row agri-backdrop__row--2"
            d="M-100,560 C300,520 560,600 940,545 C1160,512 1320,555 1540,520 L1540,640 L-100,640 Z"
            fill="url(#agriRow)"
            opacity="0.65"
          />
          <path
            className="agri-backdrop__row agri-backdrop__row--3"
            d="M-100,600 C320,565 600,625 960,585 C1180,558 1340,590 1540,565 L1540,640 L-100,640 Z"
            fill="url(#agriRow)"
            opacity="0.45"
          />
        </g>
      </svg>

      {/* Cream gradient overlay so text stays fully readable regardless
          of what's happening in the illustration underneath. */}
      <div className="agri-backdrop__overlay" />
    </div>
  );
};

export default AgriBackdrop;
