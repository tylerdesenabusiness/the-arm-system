"use client";

import { useState, useRef, useCallback } from "react";
import { Download, RotateCcw, Eraser } from "lucide-react";

const PERSONNEL = {
  "00": { rb: 0, te: 0, wr: 5, label: "00 — Empty" },
  "10": { rb: 1, te: 0, wr: 4, label: "10 — Spread" },
  "11": { rb: 1, te: 1, wr: 3, label: "11 — Standard" },
  "12": { rb: 1, te: 2, wr: 2, label: "12 — Two TE" },
  "21": { rb: 2, te: 1, wr: 2, label: "21 — Pro" },
  "22": { rb: 2, te: 2, wr: 1, label: "22 — Heavy" },
};

// WR = cyan, TE = magenta, RB = lime — reusing the site's existing accent trio
const COLORS = {
  QB: "#EDF1F8",
  RB: "#CFFF04",
  WR: "#00F0FF",
  TE: "#FF2A6D",
  OL: "#5A6570",
};

function wrSlots(n) {
  // 5-WR (empty) layout deliberately avoids x=50 so no one lines up over the QB
  const layouts = {
    0: [],
    1: [92],
    2: [8, 92],
    3: [8, 24, 92],
    4: [4, 20, 80, 96],
    5: [4, 20, 38, 80, 96],
  };
  return layouts[n] || [];
}

function teSlots(n) {
  const layouts = { 0: [], 1: [66], 2: [66, 34] };
  return layouts[n] || [];
}

function rbSlots(n) {
  const layouts = {
    0: [],
    1: [{ x: 58, y: 72 }],
    2: [{ x: 44, y: 70 }, { x: 58, y: 72 }],
  };
  return layouts[n] || [];
}

function buildFormation(code) {
  const p = PERSONNEL[code];
  let id = 0;
  const players = [];

  [40, 46, 50, 54, 60].forEach((x) => {
    players.push({ id: id++, type: "OL", x, y: 55, route: [] });
  });

  players.push({ id: id++, type: "QB", x: 50, y: 63, route: [] });

  wrSlots(p.wr).forEach((x) => {
    players.push({ id: id++, type: "WR", x, y: 55, route: [] });
  });

  teSlots(p.te).forEach((x) => {
    players.push({ id: id++, type: "TE", x, y: 55, route: [] });
  });

  rbSlots(p.rb).forEach((pos) => {
    players.push({ id: id++, type: "RB", x: pos.x, y: pos.y, route: [] });
  });

  return players;
}

function toSvgPoint(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const transformed = pt.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function pathFromPoints(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) d += ` L ${points[i].x} ${points[i].y}`;
  return d;
}

function Arrowhead({ points, color }) {
  if (points.length < 2) return null;
  const a = points[points.length - 2];
  const b = points[points.length - 1];
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  const size = 2.2;
  const p1 = { x: b.x, y: b.y };
  const p2 = { x: b.x - size * Math.cos(angle - Math.PI / 7), y: b.y - size * Math.sin(angle - Math.PI / 7) };
  const p3 = { x: b.x - size * Math.cos(angle + Math.PI / 7), y: b.y - size * Math.sin(angle + Math.PI / 7) };
  return <polygon points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`} fill={color} />;
}

// depth markers relative to the LOS (y=55), purely to help gauge spacing
const YARD_LINES = [
  { y: 45, label: "5" },
  { y: 35, label: "10" },
  { y: 25, label: "15" },
  { y: 15, label: "20" },
  { y: 65, label: "5" },
  { y: 75, label: "10" },
];

export default function ConceptCreatorPage() {
  const [code, setCode] = useState("11");
  const [players, setPlayers] = useState(() => buildFormation("11"));
  const [mode, setMode] = useState("move");
  const svgRef = useRef(null);
  const dragState = useRef(null);

  const changePersonnel = (newCode) => {
    setCode(newCode);
    setPlayers(buildFormation(newCode));
  };

  const resetFormation = () => setPlayers(buildFormation(code));
  const clearRoutes = () => setPlayers((ps) => ps.map((p) => ({ ...p, route: [] })));

  const onPointerDown = useCallback(
    (e, id) => {
      const player = players.find((p) => p.id === id);
      if (!player || player.type === "OL") return;
      e.currentTarget.setPointerCapture(e.pointerId);

      if (mode === "move") {
        dragState.current = { id, kind: "move" };
      } else {
        dragState.current = { id, kind: "route" };
        setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, route: [{ x: p.x, y: p.y }] } : p)));
      }
    },
    [mode, players]
  );

  const onPointerMove = useCallback((e) => {
    if (!dragState.current || !svgRef.current) return;
    const pt = toSvgPoint(svgRef.current, e.clientX, e.clientY);
    const x = clamp(pt.x, 0, 100);
    const y = clamp(pt.y, 0, 80);
    const { id, kind } = dragState.current;

    setPlayers((ps) =>
      ps.map((p) => {
        if (p.id !== id) return p;
        if (kind === "move") return { ...p, x, y };
        const last = p.route[p.route.length - 1];
        if (last && Math.hypot(last.x - x, last.y - y) < 1.2) return p;
        return { ...p, route: [...p.route, { x, y }] };
      })
    );
  }, []);

  const onPointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  const exportJPEG = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 960;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#05040A";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // watermark
      ctx.save();
      ctx.font = "bold 26px monospace";
      ctx.textAlign = "right";
      ctx.shadowColor = "rgba(0,240,255,0.8)";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "rgba(230,240,250,0.92)";
      ctx.fillText("THE ARM SYSTEM", canvas.width - 24, canvas.height - 28);
      ctx.shadowBlur = 0;
      ctx.font = "14px monospace";
      ctx.fillStyle = "rgba(0,240,255,0.75)";
      ctx.fillText("// concept creator", canvas.width - 24, canvas.height - 10);
      ctx.restore();

      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => {
          const link = document.createElement("a");
          link.download = `arm-system-concept-${code}.jpg`;
          link.href = URL.createObjectURL(blob);
          link.click();
        },
        "image/jpeg",
        0.92
      );
    };
    img.src = url;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black chrome-text font-display mb-1">CONCEPT CREATOR</h1>
      <p className="text-white/50 text-sm font-mono mb-6">
        // pick personnel, drag to set the formation, draw routes
      </p>

      <div className="grid grid-cols-6 gap-1.5 mb-3">
        {Object.keys(PERSONNEL).map((c) => (
          <button
            key={c}
            onClick={() => changePersonnel(c)}
            className="text-sm font-bold rounded-sm py-2 transition-colors font-mono"
            style={{
              background: code === c ? "#00F0FF" : "rgba(0,0,0,0.3)",
              color: code === c ? "#05040A" : "#EDF1F8",
              border: `1px solid ${code === c ? "#00F0FF" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="text-white/40 text-xs font-mono mb-4">{PERSONNEL[code].label}</div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="flex rounded-sm overflow-hidden border border-white/10">
          <button
            onClick={() => setMode("move")}
            className="text-xs font-semibold px-3 py-2 transition-colors"
            style={{
              background: mode === "move" ? "#CFFF04" : "rgba(0,0,0,0.3)",
              color: mode === "move" ? "#05040A" : "#EDF1F8",
            }}
          >
            Move Players
          </button>
          <button
            onClick={() => setMode("route")}
            className="text-xs font-semibold px-3 py-2 transition-colors"
            style={{
              background: mode === "route" ? "#FF2A6D" : "rgba(0,0,0,0.3)",
              color: mode === "route" ? "#05040A" : "#EDF1F8",
            }}
          >
            Draw Routes
          </button>
        </div>
        <button
          onClick={clearRoutes}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-sm border border-white/10 bg-black/30 text-white/70 hover:text-white transition-colors"
        >
          <Eraser size={13} /> Clear Routes
        </button>
        <button
          onClick={resetFormation}
          className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-sm border border-white/10 bg-black/30 text-white/70 hover:text-white transition-colors"
        >
          <RotateCcw size={13} /> Reset Formation
        </button>
        <button
          onClick={exportJPEG}
          className="ml-auto flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-sm border border-arm-blue/40 bg-arm-blue/15 text-arm-blue hover:bg-arm-blue/25 transition-colors"
        >
          <Download size={13} /> Export JPEG
        </button>
      </div>

      <div className="text-white/30 text-[11px] font-mono mb-3">
        {mode === "move"
          ? "// drag any skill player to adjust the formation"
          : "// click and drag from a player to sketch their route"}
      </div>

      <div className="relative rounded-sm overflow-hidden border border-arm-blue/30">
        <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-arm-blue/80 pointer-events-none z-10" />
        <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-arm-blue/80 pointer-events-none z-10" />
        <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-arm-blue/80 pointer-events-none z-10" />
        <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-arm-blue/80 pointer-events-none z-10" />

        <svg
          ref={svgRef}
          viewBox="0 0 100 80"
          className="w-full h-auto select-none touch-none"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <defs>
            <pattern id="turf" width="10" height="80" patternUnits="userSpaceOnUse">
              <rect width="5" height="80" fill="#1F3A22" />
              <rect x="5" width="5" height="80" fill="#24422A" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="80" fill="url(#turf)" />

          {YARD_LINES.map((yl, i) => (
            <g key={i}>
              <line x1="0" y1={yl.y} x2="100" y2={yl.y} stroke="#00F0FF" strokeWidth="0.25" opacity="0.18" />
              <text x="1.2" y={yl.y - 0.8} fontSize="2" fill="#00F0FF" opacity="0.35" fontFamily="monospace">
                {yl.label}
              </text>
            </g>
          ))}

          <line x1="0" y1="55" x2="100" y2="55" stroke="#EDF1F8" strokeWidth="0.6" strokeDasharray="2,1.5" opacity="0.55" />
          <text x="1.5" y="53" fontSize="2.4" fill="#EDF1F8" opacity="0.4" fontFamily="monospace">
            LOS
          </text>

          {players.map(
            (p) =>
              p.route.length > 1 && (
                <g key={`route-${p.id}`}>
                  <path
                    d={pathFromPoints(p.route)}
                    fill="none"
                    stroke={COLORS[p.type]}
                    strokeWidth="0.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.95"
                    style={{ filter: `drop-shadow(0 0 1.5px ${COLORS[p.type]})` }}
                  />
                  <Arrowhead points={p.route} color={COLORS[p.type]} />
                </g>
              )
          )}

          {players.map((p) => (
            <g
              key={p.id}
              onPointerDown={(e) => onPointerDown(e, p.id)}
              style={{ cursor: p.type === "OL" ? "default" : "pointer" }}
            >
              {p.type === "OL" ? (
                <rect x={p.x - 2} y={p.y - 2} width="4" height="4" fill={COLORS.OL} />
              ) : (
                <circle cx={p.x} cy={p.y} r="2.1" fill={COLORS[p.type]} stroke="#05040A" strokeWidth="0.4" />
              )}
              <text
                x={p.x}
                y={p.type === "OL" ? p.y + 5 : p.y + 4.6}
                fontSize="2.3"
                fill="#EDF1F8"
                textAnchor="middle"
                fontFamily="monospace"
                fontWeight="700"
                opacity="0.9"
              >
                {p.type}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
