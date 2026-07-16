"use client";

import { useState, useCallback } from "react";

const C = { cyan: "#00F0FF", magenta: "#FF2A6D", lime: "#CFFF04", chrome: "#EDF1F8" };

// A simple 16-bit style pixel grid for a generic rival coach.
// . = transparent, C = cap, F = face, K = headset, S = shirt, A = arm, B = clipboard, W = white/eyes
const PIXEL_ROWS = [
  "...CCCCCC...",
  "..CCCCCCCC..",
  ".CCCCCCCCCC.",
  ".CCFFFFFFCC.",
  "KKFFFFFFFFKK",
  "KKFFWFWFFFKK",
  ".KFFFFFFFFK.",
  "..FFFMMFFF..",
  "...SSSSSS...",
  "..SSSSSSSS..",
  "ASSSSSSSSSB.",
  "ASSSSSSSSBB.",
  ".SSSSSSSSB..",
  "..SS....S...",
  "..SS....S...",
];

const PIXEL_COLORS = {
  C: "#3A4048",
  F: "#D9A066",
  K: "#111318",
  S: "#1F3A63",
  A: "#D9A066",
  B: "#8B5A2B",
  W: "#111318",
  M: "#5A3A1E",
};

function PixelCoach({ mood }) {
  const size = 6;
  const rows = PIXEL_ROWS;
  const cols = rows[0].length;
  return (
    <svg
      viewBox={`0 0 ${cols * size} ${rows.length * size}`}
      width={cols * size}
      height={rows.length * size}
      shapeRendering="crispEdges"
      className={mood === "taunt" ? "coach-taunt" : mood === "sad" ? "coach-sad" : "coach-idle"}
    >
      {rows.map((row, r) =>
        row.split("").map((ch, c) =>
          ch === "." ? null : (
            <rect key={`${r}-${c}`} x={c * size} y={r * size} width={size} height={size} fill={PIXEL_COLORS[ch]} />
          )
        )
      )}
    </svg>
  );
}

const SITUATIONS = [
  {
    label: "1st & 10 — start of drive",
    passProb: 0.52,
    paProbGivenPass: 0.32,
    citation: "This OC's baseline play-action rate sits around 32% early in a drive.",
  },
  {
    label: "1st & 10 — earned (just picked up a first down)",
    passProb: 0.58,
    paProbGivenPass: 0.614,
    citation: "The single biggest tendency in his profile: 61.4% play-action on earned first downs. It's his signature trap.",
  },
  {
    label: "2nd & Medium (6-9 yards)",
    passProb: 0.55,
    paProbGivenPass: 0.35,
    citation: "Second down often swings on how the first down went, but he leans moderately pass-heavy here.",
  },
  {
    label: "3rd & Long (7+)",
    passProb: 0.82,
    paProbGivenPass: 0.14,
    citation: "Obvious passing down — defenses expect it, so play-action loses its punch and he uses it far less here.",
  },
  {
    label: "3rd & Short (1-3)",
    passProb: 0.38,
    paProbGivenPass: 0.4,
    citation: "Short yardage brings out his heaviest personnel groupings.",
  },
  {
    label: "4th Quarter, trailing",
    passProb: 0.74,
    paProbGivenPass: 0.45,
    citation: "Score differential late in games is one of the strongest predictors of his calls.",
  },
  {
    label: "Goal-to-go",
    passProb: 0.5,
    paProbGivenPass: 0.3,
    citation: "Goal-to-go is one of his more balanced situations — run and pass are close to 50/50.",
  },
];

const TAUNTS = [
  "You really thought I wasn't coming back to this look?",
  "Same play, different picture. Good luck.",
  "I've had this dialed up since Tuesday's film session.",
  "This is what I do on earned first downs. Every time.",
];

const SAD_LINES = [
  "...okay, fine, you got that one.",
  "I'll go back to the drawing board.",
  "Noted. We'll adjust the tag next series.",
  "Alright, alright — that's a stop.",
];

function rollPlay(sit) {
  const isPass = Math.random() < sit.passProb;
  const isPA = isPass && Math.random() < sit.paProbGivenPass;
  const motion = Math.random() < 0.746;
  return { isPass, isPA, motion };
}

function outcomeFor(readRun, discipline, play) {
  const readCorrectDirection = (readRun && !play.isPass) || (!readRun && play.isPass);

  if (play.isPass && play.isPA) {
    if (discipline === "aggressive") {
      return { kind: "explosive", text: "Linebackers bit on the play fake. Explosive gain." };
    }
    return { kind: "stop", text: "You stayed disciplined against the play fake. Short gain, defense holds." };
  }

  if (!readCorrectDirection) {
    return { kind: "gain", text: "Wrong side of the ball — you were geared up for the other look. Solid gain." };
  }

  if (play.isPass) {
    return { kind: "stop", text: "You were in coverage and ready for the drop-back. Incomplete or short gain." };
  }

  return discipline === "aggressive"
    ? { kind: "stop", text: "You loaded the box and got downhill fast. Tackle for short or no gain." }
    : { kind: "gain", text: "You played it safe in coverage — the run gets movement up front." };
}

export default function BeatTheOCPage() {
  const [index, setIndex] = useState(0);
  const [readRun, setReadRun] = useState(null);
  const [discipline, setDiscipline] = useState(null);
  const [reveal, setReveal] = useState(null);
  const [score, setScore] = useState({ stops: 0, plays: 0 });

  const sit = SITUATIONS[index % SITUATIONS.length];
  const mood = !reveal ? "idle" : reveal.outcome.kind === "explosive" ? "taunt" : "sad";
  const line = !reveal ? null : reveal.outcome.kind === "explosive" ? TAUNTS[index % TAUNTS.length] : SAD_LINES[index % SAD_LINES.length];

  const call = useCallback(() => {
    if (readRun === null || discipline === null) return;
    const play = rollPlay(sit);
    const outcome = outcomeFor(readRun, discipline, play);
    setReveal({ play, outcome });
    setScore((s) => ({ stops: s.stops + (outcome.kind === "stop" ? 1 : 0), plays: s.plays + 1 }));
  }, [readRun, discipline, sit]);

  const next = () => {
    setIndex((i) => i + 1);
    setReadRun(null);
    setDiscipline(null);
    setReveal(null);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <style>{`
        @keyframes coachBob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes coachTaunt { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-4deg); } }
        @keyframes coachSad { 0%, 100% { transform: translateY(0); } 100% { transform: translateY(2px); } }
        .coach-idle { animation: coachBob 1.6s ease-in-out infinite; }
        .coach-taunt { animation: coachTaunt 0.4s ease-in-out 3; }
        .coach-sad { animation: coachSad 0.3s ease-in forwards; opacity: 0.7; }
      `}</style>

      <h1 className="text-2xl font-black chrome-text font-display mb-1">BEAT THE OC</h1>
      <p className="text-white/50 text-sm font-mono mb-4">
        // real play-caller tendency patterns drive every call — you're the DC
      </p>

      <div className="flex justify-center mb-4">
        <PixelCoach mood={mood} />
      </div>

      {line && (
        <div className="text-center mb-4 px-4 py-2 rounded-sm border border-white/10 bg-black/30 inline-block mx-auto" style={{ display: "block" }}>
          <span className="text-white/80 text-sm italic">"{line}"</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="text-white/60 text-sm font-semibold">{sit.label}</div>
        <div className="text-xs font-mono text-white/40">
          {score.stops}/{score.plays} stops
        </div>
      </div>

      {!reveal && (
        <>
          <div className="mb-4">
            <div className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-2">Your read</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setReadRun(true)}
                className="text-sm font-bold py-3 rounded-sm border transition-colors"
                style={{
                  background: readRun === true ? "rgba(207,255,4,0.15)" : "rgba(255,255,255,0.05)",
                  borderColor: readRun === true ? C.lime : "rgba(255,255,255,0.1)",
                  color: readRun === true ? C.lime : C.chrome,
                }}
              >
                Load the box — expect run
              </button>
              <button
                onClick={() => setReadRun(false)}
                className="text-sm font-bold py-3 rounded-sm border transition-colors"
                style={{
                  background: readRun === false ? "rgba(0,240,255,0.15)" : "rgba(255,255,255,0.05)",
                  borderColor: readRun === false ? C.cyan : "rgba(255,255,255,0.1)",
                  color: readRun === false ? C.cyan : C.chrome,
                }}
              >
                Drop into coverage — expect pass
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-2">If it's play-action...</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setDiscipline("disciplined")}
                className="text-sm font-bold py-3 rounded-sm border transition-colors"
                style={{
                  background: discipline === "disciplined" ? "rgba(207,255,4,0.15)" : "rgba(255,255,255,0.05)",
                  borderColor: discipline === "disciplined" ? C.lime : "rgba(255,255,255,0.1)",
                  color: discipline === "disciplined" ? C.lime : C.chrome,
                }}
              >
                Stay disciplined
              </button>
              <button
                onClick={() => setDiscipline("aggressive")}
                className="text-sm font-bold py-3 rounded-sm border transition-colors"
                style={{
                  background: discipline === "aggressive" ? "rgba(255,42,109,0.15)" : "rgba(255,255,255,0.05)",
                  borderColor: discipline === "aggressive" ? C.magenta : "rgba(255,255,255,0.1)",
                  color: discipline === "aggressive" ? C.magenta : C.chrome,
                }}
              >
                Play fast, attack downhill
              </button>
            </div>
          </div>

          <button
            onClick={call}
            disabled={readRun === null || discipline === null}
            className="w-full py-3 rounded-sm font-bold text-sm disabled:opacity-30"
            style={{ background: C.cyan, color: "#05040A" }}
          >
            Snap It
          </button>
        </>
      )}

      {reveal && (
        <div className="rounded-sm border border-white/10 p-4" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div
            className="font-black text-lg mb-2"
            style={{ color: reveal.outcome.kind === "stop" ? C.lime : reveal.outcome.kind === "explosive" ? C.magenta : "#FFB800" }}
          >
            {reveal.outcome.kind === "stop" ? "STOP" : reveal.outcome.kind === "explosive" ? "EXPLOSIVE PLAY" : "GAIN"}
          </div>
          <div className="text-white/80 text-sm mb-3">
            He called a <strong>{reveal.play.isPass ? (reveal.play.isPA ? "play-action pass" : "dropback pass") : "run"}</strong>
            {reveal.play.motion ? " with pre-snap motion" : ""}.
          </div>
          <div className="text-white/70 text-sm mb-3">{reveal.outcome.text}</div>
          <div className="text-white/40 text-xs font-mono border-t border-white/10 pt-3 mb-4">{sit.citation}</div>
          <button onClick={next} className="px-5 py-2 rounded-sm font-bold text-sm" style={{ background: C.cyan, color: "#05040A" }}>
            Next Situation →
          </button>
        </div>
      )}
    </div>
  );
}
