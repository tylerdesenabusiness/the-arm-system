export const dynamic = "force-dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Poster from "@/components/Poster";
import StarRating from "@/components/StarRating";

async function getGames(q) {
  const { data, error } = await supabase
    .from("games")
    .select("id, week, opponent_id, result, score, player_id, players(name, team_id), ratings(stars)")
    .order("game_date", { ascending: false })
    .limit(24);

  if (error) {
    console.error(error);
    return [];
  }

  const withAvg = data.map((g) => {
    const stars = g.ratings.map((r) => r.stars);
    const avg = stars.length ? stars.reduce((a, b) => a + b, 0) / stars.length : 0;
    return { ...g, avgRating: Math.round(avg * 10) / 10, ratingCount: stars.length };
  });

  if (!q) return withAvg;
  const lower = q.toLowerCase();
  return withAvg.filter(
    (g) =>
      g.players?.name?.toLowerCase().includes(lower) ||
      g.players?.team_id?.toLowerCase().includes(lower) ||
      g.opponent_id?.toLowerCase().includes(lower)
  );
}

async function getPlayers() {
  const { data, error } = await supabase
    .from("players")
    .select("id, name, team_id, games(ratings(stars))")
    .limit(30);
  if (error) {
    console.error(error);
    return [];
  }
  return data.map((p) => {
    const allStars = (p.games || []).flatMap((g) => (g.ratings || []).map((r) => r.stars));
    const avg = allStars.length ? allStars.reduce((a, b) => a + b, 0) / allStars.length : 0;
    return { ...p, careerAvg: Math.round(avg * 10) / 10, careerCount: allStars.length };
  });
}

export default async function HomePage({ searchParams }) {
  const q = searchParams?.q || "";
  const [games, players] = await Promise.all([getGames(q), getPlayers()]);

  const empty = games.length === 0 && players.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black chrome-text mb-2 font-display tracking-wide">
          RATE EVERY QUARTERBACK START.
        </h1>
        <p className="text-white/50 text-sm max-w-md font-mono">
          track the college qb games you watched // rate them // see what everyone else thought
        </p>
      </div>

      {empty && (
        <div className="border border-arm-blue/30 bg-black/30 rounded p-6 text-white/60 text-sm mb-10 font-mono">
          No games in the database yet. Run <code className="text-arm-blue">npm run ingest</code> to
          pull real games from CollegeFootballData, then refresh this page.
        </div>
      )}

      {games.length > 0 && (
        <>
          <h2 className="text-arm-blue/80 text-xs uppercase tracking-widest font-semibold mb-4 font-mono">
            // {q ? `results_for: "${q}"` : "recent_games"}
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-12">
            {games.map((g) => (
              <Link key={g.id} href={`/game/${g.id}`} className="text-left group block">
                <Poster team={g.players?.team_id} name={g.players?.name} subtitle={`vs ${g.opponent_id}`} />
                <div className="mt-1.5 flex items-center gap-1">
                  <StarRating value={g.avgRating} size={11} />
                  <span className="text-[10px] text-white/40 font-mono">{g.avgRating || "—"}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {players.length > 0 && (
        <>
          <h2 className="text-arm-blue/80 text-xs uppercase tracking-widest font-semibold mb-4 font-mono">
            // players // career average
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {players.map((p) => (
              <Link
                key={p.id}
                href={`/player/${p.id}`}
                className="flex items-center gap-3 bg-black/30 border border-arm-blue/10 hover:border-arm-blue/50 rounded p-3 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 font-display">
                  {p.name.split(" ").map((w) => w[0]).join("")}
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-semibold font-display">{p.name}</div>
                  <div className="text-white/40 text-xs font-mono">{p.team_id}</div>
                </div>
                <div className="text-right">
                  <div className="text-arm-orange text-sm font-bold font-mono">{p.careerAvg || "—"}</div>
                  <div className="text-white/30 text-[10px] font-mono">{p.careerCount} rated</div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
