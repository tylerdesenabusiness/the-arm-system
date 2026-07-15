"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, BookOpen, Search, Award, Aperture, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ACHIEVEMENTS = [
  {
    id: "getting_started",
    title: "Getting Started",
    description: "Rate a game.",
    icon: Star,
  },
  {
    id: "scholarly",
    title: "Scholarly",
    description: "Write a review for a game.",
    icon: BookOpen,
  },
  {
    id: "scouting_report",
    title: "Scouting Report Material",
    description: "Review 3+ games for the same player.",
    icon: Search,
    target: 3,
  },
  {
    id: "aficionado",
    title: "Aficionado",
    description: "Rate and review 10+ games for the same player.",
    icon: Award,
    target: 10,
  },
  {
    id: "ball_knower",
    title: "Ball-Knower",
    description: 'Use the term "all-22" in a review.',
    icon: Aperture,
  },
];

export default function TrophiesPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({});

  useEffect(() => {
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user ?? null;
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      const { data: ratings } = await supabase
        .from("ratings")
        .select("stars, review_text, games(player_id, players(name))")
        .eq("user_id", currentUser.id);

      const all = ratings || [];
      const reviewed = all.filter((r) => r.review_text && r.review_text.trim().length > 0);

      const byPlayer = {};
      reviewed.forEach((r) => {
        const pname = r.games?.players?.name || "Unknown";
        byPlayer[pname] = (byPlayer[pname] || 0) + 1;
      });

      const bestPlayerEntry = Object.entries(byPlayer).sort((a, b) => b[1] - a[1])[0];
      const bestPlayerName = bestPlayerEntry?.[0];
      const bestPlayerCount = bestPlayerEntry?.[1] || 0;

      const ballKnower = reviewed.some((r) => {
        const t = r.review_text.toLowerCase();
        return t.includes("all-22") || t.includes("all 22");
      });

      setStatus({
        getting_started: { unlocked: all.length >= 1 },
        scholarly: { unlocked: reviewed.length >= 1 },
        scouting_report: { unlocked: bestPlayerCount >= 3, playerName: bestPlayerName },
        aficionado: { unlocked: bestPlayerCount >= 10, playerName: bestPlayerName },
        ball_knower: { unlocked: ballKnower },
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8 text-white/50 text-sm">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-black chrome-text font-display mb-3">TROPHIES</h1>
        <p className="text-white/50 text-sm">
          <Link href="/login" className="text-arm-blue">Sign in</Link> to start earning trophies.
        </p>
      </div>
    );
  }

  const unlockedCount = ACHIEVEMENTS.filter((a) => status[a.id]?.unlocked).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black chrome-text font-display mb-1">TROPHIES</h1>
      <p className="text-white/50 text-sm font-mono mb-8">
        // {unlockedCount}/{ACHIEVEMENTS.length} unlocked — the rest stay secret until you earn them
      </p>

      <div className="space-y-3">
        {ACHIEVEMENTS.map((a) => {
          const s = status[a.id] || {};
          const Icon = a.icon;
          const unlocked = s.unlocked;

          return (
            <div
              key={a.id}
              className={`relative flex items-center gap-4 rounded-sm border p-4 transition-colors ${
                unlocked
                  ? "border-arm-orange/50 bg-arm-orange/5"
                  : "border-white/10 bg-black/30"
              }`}
            >
              <span className={`absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${unlocked ? "border-arm-orange/70" : "border-white/20"}`} />
              <span className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${unlocked ? "border-arm-orange/70" : "border-white/20"}`} />

              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                  unlocked ? "bg-arm-orange/20" : "bg-white/5"
                }`}
              >
                {unlocked ? (
                  <Icon size={22} style={{ color: "#FF2A6D", filter: "drop-shadow(0 0 4px rgba(255,42,109,0.8))" }} />
                ) : (
                  <Lock size={18} className="text-white/30" />
                )}
              </div>

              <div className="flex-1">
                {unlocked ? (
                  <>
                    <div className="font-display font-bold text-sm chrome-text">{a.title}</div>
                    <div className="text-white/40 text-xs font-mono mt-0.5">{a.description}</div>
                    {a.target && s.playerName && (
                      <div className="text-arm-orange/70 text-[11px] font-mono mt-1">
                        earned on {s.playerName}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="font-display font-bold text-sm text-white/40 tracking-widest">???</div>
                    <div className="text-white/25 text-xs font-mono mt-0.5">Locked — keep using the site to find out.</div>
                  </>
                )}
              </div>

              {unlocked && (
                <span className="text-arm-green text-[10px] font-mono uppercase tracking-wide font-bold shrink-0">
                  unlocked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
