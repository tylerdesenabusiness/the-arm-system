export const dynamic = "force-dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { teamColors } from "@/lib/teams";
import PlayerCard from "@/components/PlayerCard";
import StarRating from "@/components/StarRating";

async function getGames(q) {
  const { data, error } = await supabase
    .from("games")
    .select("id, week, opponent_id, result, score, player_id, players(name, team_id), ratings(stars)")
    .order("game_date", { ascending: false })
    .limit(12);

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

async function getPlayers(q) {
  const { data, error } = await supabase
    .from("players")
    .select("id, name, team_id, games(ratings(stars))");
  if (error) {
    console.error(error);
    return [];
  }
  const withAvg = data.map((p) => {
    const allStars = (p.games || []).flatMap((g) => (g.ratings || []).map((r) => r.stars));
    const avg = allStars.length ? allStars.reduce((a, b) => a + b, 0) / allStars.length : 0;
    return { ...p, careerAvg: Math.round(avg * 10) / 10, careerCount: allStars.length };
  });

  if (!q) return withAvg;
  const lower = q.toLowerCase();
  return withAvg.filter(
    (p) => p.name.toLowerCase().includes(lower) || p.team_id.toLowerCase().includes(lower)
  );
}

export default async function HomePage({ searchParams }) {
  const q = searchParams?.q || "";
  const [players, games] = await Promise.all([getPlayers(q), getGames(q)]);

  const empty = players.length === 0 && games.length === 0;

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
          No players in the database yet. Run <code className="text-arm-blue">npm run ingest</code> to
          pull real games from CollegeFootballData, then refresh this page.
        </div>
      )}

      {players.length > 0 && (
        <>
          <h2 className="text-arm-blue/80 text-xs uppercase tracking-widest font-semibold mb-4 font-mono">
            // {q ? `players matching: "${q}"` : "players"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
            {players.map((p) => (
              <PlayerCard
                key={p.id}
                id={p.id}
                name={p.name}
                team={p.team_id}
                careerAvg={p.careerAvg}
                careerCount={p.careerCount}
              />
            ))}
          </div>
        </>
      )}

      {games.length > 0 && (
        <>
          <h2 className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3 font-mono">
            // recent games
          </h2>
          <div className="divide-y divide-white/5">
            {games.map((g) => (
              <Link
                key={g.id}
                href={`/game/${g.id}`}
                className="flex items-center justify-between gap-3 py-2 px-2 -mx-2 rounded hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: teamColors(g.players?.team_id).primary }}
                  />
                  <span className="text-white/80 text-sm truncate">
                    {g.players?.name} <span className="text-white/40">vs {g.opponent_id}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <StarRating value={g.avgRating} size={11} />
                  <span className="text-white/40 text-[10px] font-mono w-6 text-right">
                    {g.avgRating || "—"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
