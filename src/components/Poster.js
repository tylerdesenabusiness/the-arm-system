import { teamColors, initials, shortCode } from "@/lib/teams";

export default function Poster({ team, name, subtitle }) {
  const colors = teamColors(team);
  const playerInitials = initials(name);
  const oppCode = subtitle ? shortCode(subtitle.replace(/^vs\s*/i, "")) : "";

  return (
    <div className="group relative aspect-[2/3] overflow-hidden rounded-sm border border-arm-blue/30 bg-gradient-to-b from-[#12101F] to-[#07060D] p-3 flex flex-col transition-all duration-300 hover:border-arm-blue/70 hover:shadow-[0_0_18px_rgba(0,240,255,0.25)]">
      <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-arm-blue/80 pointer-events-none" />
      <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-arm-blue/80 pointer-events-none" />
      <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-arm-blue/80 pointer-events-none" />
      <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-arm-blue/80 pointer-events-none" />

      <div
        className="absolute -top-8 -left-8 w-20 h-20 rotate-45 opacity-90"
        style={{ background: colors.primary }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out [background-size:300%_300%] bg-[position:-30%_-30%] group-hover:bg-[position:130%_130%]"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 40%, rgba(0,240,255,0.35) 48%, rgba(255,42,109,0.35) 52%, transparent 60%)",
        }}
      />

      <span className="relative z-10 text-[10px] uppercase tracking-widest text-arm-blue/80 font-mono font-semibold self-end">
        {team}
      </span>

      <div className="relative z-10 flex-1 flex items-center justify-center px-1">
        <div className="w-full bg-black/80 border border-arm-blue/30 rounded-sm px-2 py-3 flex items-center justify-center">
          <div
            className="font-mono font-bold text-lg tracking-[0.2em] whitespace-nowrap"
            style={{ color: "#00F0FF", textShadow: "0 0 6px rgba(0,240,255,0.95), 0 0 12px rgba(0,240,255,0.6)" }}
          >
            {playerInitials}{" "}
            <span style={{ color: "#FF2A6D", textShadow: "0 0 6px rgba(255,42,109,0.95), 0 0 12px rgba(255,42,109,0.5)" }}>
              VS
            </span>{" "}
            {oppCode}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="font-display font-bold text-sm leading-tight chrome-text">{name}</div>
        {subtitle && <div className="text-white/50 text-[11px] mt-0.5 font-mono">{subtitle}</div>}
      </div>
    </div>
  );
}
