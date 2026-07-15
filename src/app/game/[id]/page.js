"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Poster from "@/components/Poster";
import StarRating from "@/components/StarRating";

export default function GamePage({ params }) {
  const [game, setGame] = useState(null);
  const [player, setPlayer] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [user, setUser] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [status, setStatus] = useState("");

  const load = async () => {
    const { data: g } = await supabase.from("games").select("*").eq("id", params.id).single();
    if (!g) return;
    setGame(g);

    const { data: p } = await supabase.from("players").select("*").eq("id", g.player_id).single();
    setPlayer(p);

    const { data: r } = await supabase.from("ratings").select("stars, review_text, profiles(username)").eq("game_id", params.id);
    setRatings(r || []);

    const { data: authData } = await supabase.auth.getUser();
    setUser(authData.user ?? null);

    if (authData.user) {
      const { data: mine } = await supabase
        .from("ratings")
        .select("stars, review_text")
        .eq("game_id", params.id)
        .eq("user_id", authData.user.id)
        .maybeSingle();
      setUserRating(mine ? mine.stars : 0);
      setReviewText(mine?.review_text || "");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const submitRating = async (stars) => {
    if (!user) {
      setStatus("Sign in to rate this game.");
      return;
    }
    setUserRating(stars);
    const { error } = await supabase
      .from("ratings")
      .upsert({ user_id: user.id, game_id: params.id, stars }, { onConflict: "user_id,game_id" });
    if (error) {
      setStatus("Something went wrong saving your rating.");
    } else {
      setStatus(`Saved — ${stars} stars`);
      load();
    }
  };

  const submitReview = async () => {
    if (!user || userRating === 0) return;
    const { error } = await supabase
      .from("ratings")
      .upsert(
        { user_id: user.id, game_id: params.id, stars: userRating, review_text: reviewText },
        { onConflict: "user_id,game_id" }
      );
    if (error) {
      setStatus("Couldn't save your review.");
    } else {
      setStatus("Review saved.");
      load();
    }
  };

  const clearRating = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("ratings")
      .delete()
      .eq("user_id", user.id)
      .eq("game_id", params.id);
    if (error) {
      setStatus("Couldn't clear your rating.");
    } else {
      setUserRating(0);
      setReviewText("");
      setStatus("Rating cleared.");
      load();
    }
  };

  if (!game || !player) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-white/50 text-sm">Loading…</div>;
  }

  const avg = ratings.length
    ? Math.round((ratings.reduce((s, r) => s + r.stars, 0) / ratings.length) * 10) / 10
    : 0;

  const buckets = Array.from({ length: 10 }, (_, i) => {
    const bucketValue = (i + 1) * 0.5;
    return ratings.filter((r) => r.stars === bucketValue).length;
  });
  const maxBar = Math.max(1, ...buckets);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link href="/" className="flex items-center gap-1 text-white/50 hover:text-white text-sm mb-6 w-fit">
        <ChevronLeft size={14} /> Back
      </Link>

      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        <div className="w-40 shrink-0">
          <Poster team={player.team_id} name={player.name} />
        </div>
        <div className="flex-1">
          <Link href={`/player/${player.id}`} className="text-white/50 text-xs hover:text-white flex items-center gap-1 mb-1 w-fit">
            <User size={12} /> {player.name}
          </Link>
          <h1 className="text-2xl font-black text-white mb-1 leading-tight font-display">
            {player.name} vs. {game.opponent_id}
          </h1>
          <div className="text-white/40 text-sm mb-4">
            Week {game.week} · {game.game_date}{" "}
            {game.result && (
              <span className={game.result === "W" ? "text-arm-green" : "text-[#ff5c5c]"}>
                · {game.result} {game.score}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl font-bold text-arm-orange">{avg || "—"}</span>
            <StarRating value={avg} size={18} />
          </div>
          <div className="text-white/40 text-xs mb-5">{ratings.length.toLocaleString()} ratings</div>

          <div className="bg-white/5 rounded p-4 inline-block">
            <div className="text-white/60 text-xs uppercase tracking-wide font-semibold mb-2">Your rating</div>
            <StarRating value={userRating} size={26} interactive onChange={submitRating} />
            <div className="flex items-center gap-3 mt-2">
              {status && <div className="text-arm-green text-xs">{status}</div>}
              {userRating > 0 && (
                <button
                  onClick={clearRating}
                  className="text-white/40 hover:text-[#ff5c5c] text-xs underline"
                >
                  Clear rating
                </button>
              )}
            </div>
            {!user && (
              <div className="text-white/40 text-xs mt-2">
                <Link href="/login" className="text-arm-blue">Sign in</Link> to rate this game.
              </div>
            )}

            {user && userRating > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-white/60 text-xs uppercase tracking-wide font-semibold mb-2">
                  Write a review
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you think of this performance?"
                  rows={3}
                  className="w-full bg-black/40 border border-arm-blue/20 rounded px-3 py-2 text-white text-sm outline-none placeholder-white/30 focus:border-arm-blue/60 transition-colors"
                />
                <button
                  onClick={submitReview}
                  className="mt-2 bg-arm-blue/20 text-arm-blue border border-arm-blue/40 text-xs font-semibold rounded px-3 py-1.5 hover:bg-arm-blue/30 transition-colors"
                >
                  Save review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-white/80 text-xs uppercase tracking-widest font-semibold mb-3">Rating distribution</h2>
        <div className="flex items-end gap-1 h-16">
          {buckets.map((v, i) => (
            <div
              key={i}
              className="flex-1 bg-arm-orange/70 rounded-t-sm"
              style={{ height: `${(v / maxBar) * 100}%` }}
              title={`${(i + 1) * 0.5} stars`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-white/30 mt-1">
          <span>0.5</span>
          <span>5.0</span>
        </div>
      </div>

      <div>
        <h2 className="text-white/80 text-xs uppercase tracking-widest font-semibold mb-3">Reviews</h2>
        <div className="space-y-4">
          {ratings.filter((r) => r.review_text).map((r, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 shrink-0">
                {(r.profiles?.username || "?")[0].toUpperCase()}
              </div>
              <div>
                <div className="text-white text-xs font-semibold mb-0.5">{r.profiles?.username || "anonymous"}</div>
                <div className="text-white/60 text-sm leading-snug">{r.review_text}</div>
                <div className="text-arm-orange text-xs mt-1">{r.stars} stars</div>
              </div>
            </div>
          ))}
          {ratings.filter((r) => r.review_text).length === 0 && (
            <div className="text-white/40 text-sm">No reviews yet — be the first.</div>
          )}
        </div>
      </div>
    </div>
  );
}
