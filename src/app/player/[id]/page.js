export const dynamic = "force-dynamic";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { teamColors, initials } from "@/lib/teams";
import StarRating from "@/components/StarRating";

export default async function PlayerPage({ params }) {
  const { data: player } = await supabase.from("players").select("*").eq("id", params.id).single();

  const { data: games } = await supabase
    .from("games")
    .select("id, week, season, season_type, opponent_id, result, score, game_date, ratings(stars)")
    .eq("player_id", params.id)
    .order("game_date", { ascending: true });

  const withAvg = (games || []).map((g) => {
    const stars = g.ratings.map((r) => r.stars);
    const avg = stars.length ? stars.reduce((a, b) => a + b, 0) / stars.length : 0;
    return { ...g, avgRating: Math.round(avg * 10) / 10, ratingCount: stars.length };
  });

  // Career average only counts games that actually have at least one rating —
  // unrated games don't drag the average down as if they were 0 stars.
  const ratedGames = withAvg.filter((g) => g.ratingCount > 0);
  const careerAvg = ratedGames.length
    ? (ratedGames.reduce((s, g) => s + g.avgRating, 0) / ratedGames.length).toFixed(2)
    : "—";

  if (!player) {
    return <div className="max-w-5xl mx-auto px-4 py-8 text-white/60">Player not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Link href="/" className="flex items-center gap-1 text-white/50 hover:text-white text-sm mb-6 w-fit">
        <ChevronLeft size={14} /> Back
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
          style={{ background: teamColors(player.team_id).primary }}
        >
          {initials(player.name)}
        </div>
        <div>
          <h1 className="text-2xl font-black text-white font-display">{player.name}</h1>
          <div className="text-white/50 text-sm">{player.team_id} · QB</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-bold text-arm-orange">{careerAvg}</div>
          <div className="text-white/40 text-[10px] uppercase tracking-wide">
            career avg{ratedGames.length ? ` · ${ratedGames.length} rated` : ""}
          </div>
        </div>
      </div>

      <h2 className="text-white/80 text-xs uppercase tracking-widest font-semibold mb-3">Games</h2>
      <div className="divide-y divide-white/10">
        {withAvg.map((g) => (
          <Link
            key={g.id}
            href={`/game/${g.id}`}
            className="w-full flex items-center gap-4 py-3 hover:bg-white/5 px-2 -mx-2 rounded transition-colors"
          >
            <div className="w-16 text-white/40 text-xs font-mono">
              {g.season_type === "postseason" ? "Bowl" : `Wk ${g.week}`}
            </div>
            <div className="flex-1">
              <div className="text-white text-sm font-medium">vs {g.opponent_id}</div>
              <div className="text-white/40 text-xs">{g.game_date}</div>
            </div>
            {g.result && (
              <div className={`text-xs font-mono ${g.result === "W" ? "text-arm-green" : "text-[#ff5c5c]"}`}>
                {g.result} {g.score}
              </div>
            )}
            <StarRating value={g.avgRating} size={13} />
          </Link>
        ))}
        {withAvg.length === 0 && (
          <div className="text-white/40 text-sm py-6">No games loaded for this player yet.</div>
        )}
      </div>
    </div>
  );
}
