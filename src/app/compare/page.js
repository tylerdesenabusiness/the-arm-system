"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CompareCard from "@/components/CompareCard";

function expectedScore(a, b) {
  return 1 / (1 + Math.pow(10, (b - a) / 400));
}

export default function ComparePage() {
  const [user, setUser] = useState(null);
  const [players, setPlayers] = useState([]);
  const [pair, setPair] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [voteCount, setVoteCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadRankings = useCallback(async (userId) => {
    const { data } = await supabase
      .from("qb_elo")
      .select("elo, wins, losses, players(id, name, team_id)")
      .eq("user_id", userId)
      .order("elo", { ascending: false })
      .limit(10);
    setRankings(data || []);
  }, []);

  const pickPair = useCallback((list) => {
    if (list.length < 2) return;
    const a = list[Math.floor(Math.random() * list.length)];
    let b = list[Math.floor(Math.random() * list.length)];
    while (b.id === a.id) {
      b = list[Math.floor(Math.random() * list.length)];
    }
    setPair([a, b]);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user ?? null;
      setUser(currentUser);

      const { data: allPlayers } = await supabase.from("players").select("id, name, team_id");
      setPlayers(allPlayers || []);
      pickPair(allPlayers || []);

      if (currentUser) {
        await loadRankings(currentUser.id);
        const { count } = await supabase
          .from("qb_votes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", currentUser.id);
        setVoteCount(count || 0);
      }
      setLoading(false);
    })();
  }, [pickPair, loadRankings]);

  const vote = async (winner, loser) => {
    if (!user) return;

    const getElo = async (playerId) => {
      const { data } = await supabase
        .from("qb_elo")
        .select("elo, wins, losses")
        .eq("user_id", user.id)
        .eq("player_id", playerId)
        .maybeSingle();
      return data || { elo: 1500, wins: 0, losses: 0 };
    };

    const winnerElo = await getElo(winner.id);
    const loserElo = await getElo(loser.id);

    const K = 32;
    const expWinner = expectedScore(winnerElo.elo, loserElo.elo);
    const expLoser = expectedScore(loserElo.elo, winnerElo.elo);
    const newWinnerElo = Math.round(winnerElo.elo + K * (1 - expWinner));
    const newLoserElo = Math.round(loserElo.elo + K * (0 - expLoser));

    await supabase.from("qb_elo").upsert({
      user_id: user.id,
      player_id: winner.id,
      elo: newWinnerElo,
      wins: winnerElo.wins + 1,
      losses: winnerElo.losses,
    });
    await supabase.from("qb_elo").upsert({
      user_id: user.id,
      player_id: loser.id,
      elo: newLoserElo,
      wins: loserElo.wins,
      losses: loserElo.losses + 1,
    });
    await supabase.from("qb_votes").insert({
      user_id: user.id,
      winner_id: winner.id,
      loser_id: loser.id,
    });

    setVoteCount((c) => c + 1);
    await loadRankings(user.id);
    pickPair(players);
  };

  const resetRankings = async () => {
    if (!user) return;
    const confirmed = window.confirm("Reset all your comparisons and start your ranking over from scratch?");
    if (!confirmed) return;

    await supabase.from("qb_elo").delete().eq("user_id", user.id);
    await supabase.from("qb_votes").delete().eq("user_id", user.id);
    setRankings([]);
    setVoteCount(0);
    pickPair(players);
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-8 text-white/50 text-sm">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-black chrome-text font-display mb-3">COMPARE</h1>
        <p className="text-white/50 text-sm">
          <Link href="/login" className="text-arm-blue">Sign in</Link> to start building your rankings.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black chrome-text font-display mb-1 text-center">WHO YOU GOT?</h1>
      <p className="text-white/50 text-sm font-mono mb-10 text-center">
        // {voteCount} comparisons made — pick the better QB
      </p>

      {pair.length === 2 && (
        <div className="relative flex items-center justify-center gap-6 mb-16 max-w-2xl mx-auto">
          <div className="w-full max-w-[220px]" onClick={() => vote(pair[0], pair[1])}>
            <CompareCard team={pair[0].team_id} name={pair[0].name} />
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 z-30 flex items-center justify-center w-14 h-14 rounded-full bg-black border-2 border-arm-orange/60 shrink-0">
            <span
              className="font-display font-black text-lg"
              style={{ color: "#FF2A6D", textShadow: "0 0 8px rgba(255,42,109,0.9), 0 0 16px rgba(255,42,109,0.5)" }}
            >
              VS
            </span>
          </div>

          <div className="w-full max-w-[220px]" onClick={() => vote(pair[1], pair[0])}>
            <CompareCard team={pair[1].team_id} name={pair[1].name} />
          </div>
        </div>
      )}

      {user && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-arm-blue/80 text-xs uppercase tracking-widest font-semibold font-mono">
              // your top guys
            </h2>
            {rankings.length > 0 && (
              <button
                onClick={resetRankings}
                className="text-white/40 hover:text-[#ff5c5c] text-xs underline"
              >
                Reset rankings
              </button>
            )}
          </div>
          <div className="space-y-1">
            {rankings.map((r, i) => (
              <div
                key={r.players.id}
                className="flex items-center gap-3 bg-black/30 border border-white/10 rounded px-3 py-2"
              >
                <span className="text-white/30 text-xs font-mono w-5">{i + 1}</span>
                <span className="text-white text-sm font-semibold flex-1">{r.players.name}</span>
                <span className="text-white/40 text-xs font-mono">{r.players.team_id}</span>
              </div>
            ))}
            {rankings.length === 0 && (
              <div className="text-white/40 text-sm">Vote on a few matchups to build your rankings.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
