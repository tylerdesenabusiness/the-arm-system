import Link from "next/link";
import { teamColors } from "@/lib/teams";

const SKIN = "#D9A066";
const OUTLINE = "#0A0E12";
const LEG_STROKE = "#8A93AD";
const CLEAT = "#EDF1F8";

function QBFigure({ colors }) {
  const pivot = { transformBox: "fill-box", transformOrigin: "0% 50%" };
  const hipPivot = { transformBox: "fill-box", transformOrigin: "50% 0%" };
  const sw = 2.2;

  return (
    <svg viewBox="0 0 120 160" className="w-full h-full">
      <g
        className="transition-transform duration-300 ease-out rotate-0 group-hover:-rotate-[7deg]"
        style={hipPivot}
        transform="translate(0 0)"
      >
        <g transform="translate(76 96)">
          <g
            className="transition-transform duration-300 ease-out rotate-[78deg] group-hover:rotate-[62deg]"
            style={pivot}
          >
            <rect x="0" y="-4.5" width="30" height="9" rx="2" fill={colors.secondary} stroke={LEG_STROKE} strokeWidth={sw} />
          </g>
        </g>
        <g transform="translate(44 96)">
          <g
            className="transition-transform duration-300 ease-out rotate-[100deg] group-hover:rotate-[112deg]"
            style={pivot}
          >
            <rect x="0" y="-4.5" width="30" height="9" rx="2" fill={colors.secondary} stroke={LEG_STROKE} strokeWidth={sw} />
          </g>
        </g>
        <ellipse cx="26" cy="130" rx="7" ry="2.8" fill={CLEAT} stroke={OUTLINE} strokeWidth="1.6" />
        <ellipse cx="90" cy="130" rx="7" ry="2.8" fill={CLEAT} stroke={OUTLINE} strokeWidth="1.6" />

        <polygon
          points="37,62 83,62 76,102 44,102"
          fill={colors.primary}
          stroke={OUTLINE}
          strokeWidth={sw}
        />
        <text x="60" y="88" fontSize="16" fontWeight="800" fill={colors.secondary} textAnchor="middle" fontFamily="Arial, sans-serif">
          7
        </text>

        <polygon points="27,55 45,55 41,68 23,65" fill={colors.secondary} stroke={OUTLINE} strokeWidth={sw} />
        <polygon points="93,55 75,55 79,68 97,65" fill={colors.secondary} stroke={OUTLINE} strokeWidth={sw} />

        <circle cx="60" cy="31" r="21" fill={colors.secondary} stroke={OUTLINE} strokeWidth={sw} />
        <polygon points="57.5,10 62.5,10 64,31 56,31" fill={colors.primary} stroke={OUTLINE} strokeWidth="1.3" />

        <path
          d="M 48 34 Q 47 24 60 22 Q 73 24 72 34 Q 72 44 66 50 L 54 50 Q 48 44 48 34 Z"
          fill={SKIN}
          stroke={OUTLINE}
          strokeWidth={sw}
        />
        <line x1="50" y1="33" x2="57" y2="35" stroke={OUTLINE} strokeWidth="2.1" strokeLinecap="round" />
        <line x1="70" y1="33" x2="63" y2="35" stroke={OUTLINE} strokeWidth="2.1" strokeLinecap="round" />
        <line x1="55" y1="46" x2="65" y2="46" stroke={OUTLINE} strokeWidth="1.8" strokeLinecap="round" />

        <g stroke="#B9C0C6" strokeWidth="2" strokeLinecap="round">
          <line x1="47" y1="40" x2="73" y2="40" />
          <line x1="47" y1="45" x2="73" y2="45" />
          <line x1="48" y1="50" x2="72" y2="50" />
          <line x1="49" y1="31" x2="45" y2="50" />
          <line x1="71" y1="31" x2="75" y2="50" />
        </g>

        <g transform="translate(26 64)">
          <g
            className="transition-transform duration-300 ease-out rotate-[45deg] group-hover:-rotate-[15deg]"
            style={pivot}
          >
            <rect x="0" y="-4.5" width="19" height="9" rx="3" fill={colors.primary} stroke={OUTLINE} strokeWidth={sw} />
          </g>
        </g>

        <g transform="translate(94 64)">
          <g
            className="transition-transform duration-300 ease-out rotate-[145deg] group-hover:-rotate-[95deg]"
            style={pivot}
          >
            <rect x="0" y="-5" width="18" height="10" rx="3" fill={colors.primary} stroke={OUTLINE} strokeWidth={sw} />
            <g transform="translate(18 0)">
              <g
                className="transition-transform duration-300 ease-out rotate-[190deg] group-hover:rotate-[95deg]"
                style={pivot}
              >
                <rect x="0" y="-4.5" width="17" height="9" rx="3" fill={colors.primary} stroke={OUTLINE} strokeWidth={sw} />
                <ellipse cx="18" cy="0" rx="6.8" ry="4.8" fill="#8B4A1F" stroke={OUTLINE} strokeWidth="1.7" />
                <line x1="14.5" y1="0" x2="21.5" y2="0" stroke="#F4EDE0" strokeWidth="0.85" opacity="0.85" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

export default function PlayerCard({ id, name, team, careerAvg, careerCount }) {
  const colors = teamColors(team);
  return (
    <Link
      href={`/player/${id}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-sm border border-arm-blue/30 flex flex-col transition-all duration-300 hover:border-arm-blue/70 hover:shadow-[0_0_18px_rgba(0,240,255,0.25)]"
      style={{ background: `linear-gradient(165deg, ${colors.primary}22 0%, #07060D 65%)` }}
    >
      <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-arm-blue/80 pointer-events-none z-10" />
      <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-arm-blue/80 pointer-events-none z-10" />
      <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-arm-blue/80 pointer-events-none z-10" />
      <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-arm-blue/80 pointer-events-none z-10" />

      <div
        className="absolute -top-8 -left-8 w-20 h-20 rotate-45 opacity-90"
        style={{ background: colors.primary }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out [background-size:300%_300%] bg-[position:-30%_-30%] group-hover:bg-[position:130%_130%]"
        style={{
          backgroundImage: `linear-gradient(115deg, transparent 40%, ${colors.primary}55 48%, ${colors.secondary}55 52%, transparent 60%)`,
        }}
      />

      <span className="relative z-10 text-[10px] uppercase tracking-widest text-arm-blue/80 font-mono font-semibold self-end p-3 pb-0 shrink-0">
        {team}
      </span>

      <div className="relative z-10 flex-1 min-h-0 flex items-center justify-center px-6 py-1">
        <div className="w-full h-full max-h-[70%]">
          <QBFigure colors={colors} />
        </div>
      </div>

      <div className="relative z-10 text-center px-3 pb-3 pt-1 shrink-0">
        <div className="font-display font-bold text-sm leading-tight chrome-text truncate">{name}</div>
        <div className="flex items-center justify-center gap-1 mt-1">
          <span className="text-arm-orange text-xs font-mono font-bold">{careerAvg || "—"}</span>
          <span className="text-white/30 text-[10px] font-mono">({careerCount} rated)</span>
        </div>
      </div>
    </Link>
  );
}
