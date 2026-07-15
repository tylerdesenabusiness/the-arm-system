import { teamColors, initials } from "@/lib/teams";

export default function CompareCard({ team, name }) {
  const colors = teamColors(team);

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-sm border border-arm-blue/30 bg-gradient-to-b from-[#151129] to-[#07060D] flex flex-col transition-all duration-300 hover:border-arm-orange/70 hover:shadow-[0_0_28px_rgba(255,42,109,0.3)] cursor-pointer">
      <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-arm-blue/80 pointer-events-none z-20" />
      <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-arm-blue/80 pointer-events-none z-20" />
      <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-arm-blue/80 pointer-events-none z-20" />
      <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-arm-blue/80 pointer-events-none z-20" />

      <div
        className="absolute -top-10 -left-10 w-28 h-28 rotate-45 opacity-80"
        style={{ background: colors.primary }}
      />
      <div
        className="absolute -bottom-10 -right-10 w-28 h-28 rotate-45 opacity-30"
        style={{ background: colors.secondary }}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out [background-size:300%_300%] bg-[position:-30%_-30%] group-hover:bg-[position:130%_130%] z-10"
        style={{
          backgroundImage:
            "linear-gradient(115deg, transparent 40%, rgba(0,240,255,0.35) 48%, rgba(255,42,109,0.35) 52%, transparent 60%)",
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center gap-3">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-display font-black text-white border-2 border-white/20"
          style={{ background: `linear-gradient(160deg, ${colors.primary}, ${colors.secondary})` }}
        >
          {initials(name)}
        </div>
        <div className="font-display font-black text-xl leading-tight chrome-text">{name}</div>
        <div className="text-[11px] uppercase tracking-widest text-arm-blue/80 font-mono font-semibold">
          {team}
        </div>
      </div>
    </div>
  );
}
