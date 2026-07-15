"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Trophy, Swords, HeartHandshake, PencilRuler } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const loadProfile = async (u) => {
      if (!u) {
        setUsername(null);
        return;
      }
      const { data } = await supabase.from("profiles").select("username").eq("id", u.id).single();
      setUsername(data?.username || null);
    };

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      loadProfile(data.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      loadProfile(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="sticky top-0 z-20 bg-bg/90 backdrop-blur border-b border-arm-blue/20">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="font-display font-black text-lg tracking-widest glitch-text whitespace-nowrap">
          THE ARM <span className="text-arm-orange">SYSTEM</span>
        </Link>
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 bg-black/40 border border-arm-blue/20 rounded px-3 py-1.5 max-w-sm focus-within:border-arm-blue/70 transition-colors">
          <Search size={14} className="text-arm-blue/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search players, teams..."
            className="bg-transparent outline-none text-sm text-white placeholder-white/30 w-full font-mono"
          />
        </form>
        <Link href="/compare" className="flex items-center gap-1 text-white/60 hover:text-arm-blue text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap">
          <Swords size={14} />
          Compare
        </Link>
        <Link href="/concept-creator" className="flex items-center gap-1 text-white/60 hover:text-arm-blue text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap">
          <PencilRuler size={14} />
          Concepts
        </Link>
        <Link href="/trophies" className="flex items-center gap-1 text-white/60 hover:text-arm-orange text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap">
          <Trophy size={14} />
          Trophies
        </Link>
        <Link href="/support" className="flex items-center gap-1 text-white/60 hover:text-arm-green text-xs font-semibold uppercase tracking-wide transition-colors whitespace-nowrap">
          <HeartHandshake size={14} />
          Support
        </Link>
        <div className="ml-auto">
          {user ? (
            username ? (
              <Link href={`/u/${username}`} className="text-white/50 hover:text-white text-xs font-mono">
                @{username}
              </Link>
            ) : (
              <span className="text-white/50 text-xs font-mono">{user.email}</span>
            )
          ) : (
            <Link href="/login" className="text-arm-blue text-xs font-semibold uppercase tracking-wide">
              Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
