"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-black text-white mb-2 font-display">Sign in</h1>
      <p className="text-white/50 text-sm mb-6">
        Enter your email and we&apos;ll send you a magic link — no password needed.
      </p>

      {sent ? (
        <div className="bg-white/5 rounded p-4 text-arm-green text-sm">
          Check your email for a sign-in link.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-white/5 rounded px-3 py-2 text-white outline-none placeholder-white/30 text-sm"
          />
          <button
            type="submit"
            className="w-full bg-arm-green text-black font-semibold text-sm rounded py-2 hover:opacity-90"
          >
            Send magic link
          </button>
          {error && <div className="text-[#ff5c5c] text-xs">{error}</div>}
        </form>
      )}
    </div>
  );
}
