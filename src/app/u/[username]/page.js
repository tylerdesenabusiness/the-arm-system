export const dynamic = "force-dynamic";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import StarRating from "@/components/StarRating";

export default async function PublicProfilePage({ params }) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", params.username)
    .single();

  if (!profile) {
    return <div className="max-w-3xl mx-auto px-4 py-8 text-white/60">User not found.</div>;
  }

  const { data: ratings } = await supabase
    .from("ratings")
    .select("stars, review_text, created_at, game_id, games(opponent_id, week, players(id, name, team_id))")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const { data: rankings } = await supabase
    .from("qb_elo")
    .select("elo, players(id, name, team_id)")
    .eq("user_id", profile.id)
    .order("elo", { ascending: false })
    .limit(10);

  const reviews = (ratings || []).filter((r) => r.review_text && r.review_text.trim());

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black chrome-text font-display mb-1">@{profile.username}</h1>
      <p className="text-white/50 text-sm font-mono mb-8">
        // {ratings?.length || 0} rated · {reviews.length} reviewed
      </p>

      {rankings && rankings.length > 0 && (
        <>
          <h2 className="text-arm-blue/80 text-xs uppercase tracking-widest font-semibold mb-4 font-mono">
            // top guys
          </h2>
          <div className="space-y-1 mb-10">
            {rankings.map((r, i) => (
              <Link
                key={r.players.id}
                href={`/player/${r.players.id}`}
                className="flex items-center gap-3 bg-black/30 border border-white/10 hover:border-arm-blue/50 rounded px-3 py-2 transition-colors"
              >
                <span className="text-white/30 text-xs font-mono w-5">{i + 1}</span>
                <span className="text-white text-sm font-semibold flex-1">{r.players.name}</span>
                <span className="text-white/40 text-xs font-mono">{r.players.team_id}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      <h2 className="text-arm-blue/80 text-xs uppercase tracking-widest font-semibold mb-4 font-mono">
        // ratings & reviews
      </h2>
      <div className="space-y-4">
        {(ratings || []).map((r, i) => (
          <Link
            key={i}
            href={`/game/${r.game_id}`}
            className="flex gap-3 bg-black/30 border border-white/10 hover:border-arm-blue/50 rounded p-3 transition-colors"
          >
            <StarRating value={r.stars} size={14} />
            <div className="flex-1">
              <div className="text-white text-sm font-medium">
                {r.games?.players?.name} vs {r.games?.opponent_id}
              </div>
              {r.review_text && (
                <div className="text-white/60 text-sm mt-1 leading-snug">{r.review_text}</div>
              )}
            </div>
          </Link>
        ))}
        {(!ratings || ratings.length === 0) && (
          <div className="text-white/40 text-sm">No ratings yet.</div>
        )}
      </div>
    </div>
  );
}
