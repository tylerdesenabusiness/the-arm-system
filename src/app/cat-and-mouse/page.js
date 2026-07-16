"use client";

import { useState, useCallback } from "react";

const COLS = 9;
const ROWS = 8;
const CELL = 10;
const OPEN_DIST = 2.1; // chebyshev-ish distance needed to be "open"

const C = { cyan: "#00F0FF", magenta: "#FF2A6D", lime: "#CFFF04", chrome: "#EDF1F8", def: "#FF5C5C" };

function dist(a, b) {
  return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
}

function legalMoves(piece, occupied) {
  const moves = [];
  for (let dr = -2; dr <= 0; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      if (dr === 0 && dc === 0) continue;
      const row = piece.row + dr;
      const col = piece.col + dc;
      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) continue;
      if (occupied.some((o) => o.row === row && o.col === col)) continue;
      moves.push({ row, col });
    }
  }
  return moves;
}

function initialSetup() {
  const receivers = [
    { id: "r0", label: "X", row: 6, col: 0 },
    { id: "r1", label: "Y", row: 6, col: 3 },
    { id: "r2", label: "Z", row: 6, col: 5 },
    { id: "r3", label: "F", row: 6, col: 8 },
  ];
  const defenders = receivers.map((r, i) => ({
    id: `d${i}`,
    assignedTo: r.id,
    row: 4,
    col: r.col,
  }));
  const qb = { row: 7, col: 4 };
  return { receivers, defenders, qb };
}

export default function CatAndMousePage() {
  const [board, setBoard] = useState(() => initialSetup());
  const [round, setRound] = useState(1);
  const MAX_ROUNDS = 4;
  const [selected, setSelected] = useState(null); // receiver id currently selected to move
  const [turn, setTurn] = useState("offense"); // offense | defense (AI, auto) | done
  const [log, setLog] = useState(["Your ball. Select a receiver, then click a highlighted square to run their route."]);
  const [result, setResult] = useState(null);

  const addLog = (m) => setLog((l) => [m, ...l].slice(0, 6));

  const allOccupied = useCallback(
    (excludeId) =>
      [...board.receivers, ...board.defenders, board.qb].filter((p) => p.id !== excludeId),
    [board]
  );

  const selectedPiece = selected ? board.receivers.find((r) => r.id === selected) : null;
  const legalDest = selectedPiece ? legalMoves(selectedPiece, allOccupied(selected)) : [];

  const moveReceiver = (dest) => {
    if (!selectedPiece || turn !== "offense" || result) return;
    const newReceivers = board.receivers.map((r) => (r.id === selectedPiece.id ? { ...r, row: dest.row, col: dest.col } : r));
    setBoard((b) => ({ ...b, receivers: newReceivers }));
    setSelected(null);
    addLog(`${selectedPiece.label} runs their route.`);
    setTurn("defense");

    // AI defense reacts: matched defender closes toward the receiver that just moved
    setTimeout(() => {
      setBoard((b) => {
        const movedReceiver = newReceivers.find((r) => r.id === selectedPiece.id);
        const defenders = b.defenders.map((d) => {
          if (d.assignedTo !== movedReceiver.id) return d;
          const options = legalMoves(d, allOccupied(d.id));
          if (options.length === 0) return d;
          const best = options.sort((a, c) => dist(a, movedReceiver) - dist(c, movedReceiver))[0];
          return { ...d, row: best.row, col: best.col };
        });
        return { ...b, defenders };
      });
      addLog(`Defense rotates to close the gap.`);
      setTurn("offense");
      setRound((r) => r + 1);
    }, 500);
  };

  const throwTo = (receiver) => {
    if (turn !== "offense" || result) return;
    const defender = board.defenders.find((d) => d.assignedTo === receiver.id);
    const d = dist(receiver, defender);
    const open = d >= OPEN_DIST;
    const yardsDownfield = (7 - receiver.row) * 5;
    if (open) {
      addLog(`You throw to ${receiver.label} — OPEN, complete for ${yardsDownfield} yards!`);
      setResult("win");
    } else {
      addLog(`You throw to ${receiver.label} — covered, incomplete.`);
      setResult("loss");
    }
  };

  const newDrive = () => {
    setBoard(initialSetup());
    setRound(1);
    setSelected(null);
    setTurn("offense");
    setResult(null);
    setLog(["Your ball. Select a receiver, then click a highlighted square to run their route."]);
  };

  const roundsLeft = MAX_ROUNDS - round + 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black chrome-text font-display mb-1">CAT AND MOUSE</h1>
      <p className="text-white/50 text-sm font-mono mb-4">
        // move your receivers, read the coverage, throw when you see the window
      </p>

      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-mono text-white/50">
          Round {Math.min(round, MAX_ROUNDS)}/{MAX_ROUNDS} {result ? "" : `· ${roundsLeft} left before you must throw`}
        </div>
        <button
          onClick={newDrive}
          className="text-xs font-semibold px-3 py-1.5 rounded-sm border border-white/10 bg-black/30 text-white/70 hover:text-white transition-colors"
        >
          New Drive
        </button>
      </div>

      <div className="rounded-sm overflow-hidden border border-arm-blue/30 mb-4">
        <svg viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} className="w-full h-auto">
          <defs>
            <pattern id="cm-turf" width={CELL} height={ROWS * CELL} patternUnits="userSpaceOnUse">
              <rect width={CELL / 2} height={ROWS * CELL} fill="#12181C" />
              <rect x={CELL / 2} width={CELL / 2} height={ROWS * CELL} fill="#161D22" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={COLS * CELL} height={ROWS * CELL} fill="url(#cm-turf)" />
          <line x1="0" y1={6.5 * CELL} x2={COLS * CELL} y2={6.5 * CELL} stroke="#F4EDE0" strokeWidth="0.5" opacity="0.3" strokeDasharray="2,2" />

          {/* legal move highlights */}
          {legalDest.map((m, i) => (
            <rect
              key={i}
              x={m.col * CELL + 1}
              y={m.row * CELL + 1}
              width={CELL - 2}
              height={CELL - 2}
              fill={C.lime}
              opacity="0.18"
              stroke={C.lime}
              strokeWidth="0.4"
              style={{ cursor: "pointer" }}
              onClick={() => moveReceiver(m)}
            />
          ))}

          {/* QB */}
          <circle cx={board.qb.col * CELL + CELL / 2} cy={board.qb.row * CELL + CELL / 2} r="3" fill={C.chrome} />
          <text x={board.qb.col * CELL + CELL / 2} y={board.qb.row * CELL + CELL / 2 + 5} fontSize="3.2" fill="#F4EDE0" opacity="0.6" textAnchor="middle" fontFamily="monospace">QB</text>

          {/* defenders */}
          {board.defenders.map((d) => (
            <g key={d.id}>
              <circle cx={d.col * CELL + CELL / 2} cy={d.row * CELL + CELL / 2} r="3.4" fill={C.def} opacity="0.85" />
              <text x={d.col * CELL + CELL / 2} y={d.row * CELL + CELL / 2 + 5.5} fontSize="3" fill="#F4EDE0" textAnchor="middle" fontFamily="monospace" fontWeight="700">DB</text>
            </g>
          ))}

          {/* receivers */}
          {board.receivers.map((r) => {
            const isSelected = selected === r.id;
            return (
              <g key={r.id}>
                <circle
                  cx={r.col * CELL + CELL / 2}
                  cy={r.row * CELL + CELL / 2}
                  r="3.6"
                  fill={C.cyan}
                  stroke={isSelected ? C.lime : "#05040A"}
                  strokeWidth={isSelected ? "1.2" : "0.4"}
                  style={{ cursor: turn === "offense" && !result ? "pointer" : "default" }}
                  onClick={() => (turn === "offense" && !result ? setSelected(r.id) : null)}
                />
                <text
                  x={r.col * CELL + CELL / 2}
                  y={r.row * CELL + CELL / 2 + 5.5}
                  fontSize="3.2"
                  fill="#05040A"
                  textAnchor="middle"
                  fontFamily="monospace"
                  fontWeight="700"
                  style={{ cursor: turn === "offense" && !result ? "pointer" : "default" }}
                  onClick={() => (turn === "offense" && !result ? setSelected(r.id) : null)}
                >
                  {r.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="text-center text-white/40 text-xs font-mono mb-4">
        {turn === "offense" && !result && (selectedPiece ? "// click a highlighted square to move, or throw below" : "// click a receiver to select them")}
        {turn === "defense" && !result && "// defense is reacting..."}
      </div>

      {!result && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {board.receivers.map((r) => (
            <button
              key={r.id}
              onClick={() => throwTo(r)}
              disabled={turn !== "offense"}
              className="text-xs font-bold rounded-sm py-2 font-mono border transition-colors disabled:opacity-30"
              style={{ background: "rgba(0,240,255,0.1)", borderColor: "rgba(0,240,255,0.4)", color: C.cyan }}
            >
              Throw {r.label}
            </button>
          ))}
        </div>
      )}

      {result && (
        <div className="text-center mb-4 p-4 rounded-sm border border-white/10" style={{ background: "rgba(0,0,0,0.3)" }}>
          <div className="font-black text-lg" style={{ color: result === "win" ? C.lime : C.magenta }}>
            {result === "win" ? "BIG PLAY" : "INCOMPLETE"}
          </div>
        </div>
      )}

      <div className="space-y-1">
        {log.map((l, i) => (
          <div key={i} className="text-white/50 text-xs font-mono">{l}</div>
        ))}
      </div>
    </div>
  );
}
