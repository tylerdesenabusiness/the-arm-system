"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ value, size = 16, interactive = false, onChange }) {
  const [hover, setHover] = useState(null);
  const display = hover ?? value ?? 0;

  const handlePick = (starIndex, e) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    onChange(starIndex + (isHalf ? 0.5 : 1));
  };

  const handleMove = (starIndex, e) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    setHover(starIndex + (isHalf ? 0.5 : 1));
  };

  return (
    <div className="inline-flex" onMouseLeave={() => interactive && setHover(null)}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fillPct = Math.max(0, Math.min(1, display - i)) * 100;
        return (
          <div
            key={i}
            className="relative"
            style={{ width: size, height: size, cursor: interactive ? "pointer" : "default" }}
            onMouseMove={(e) => handleMove(i, e)}
            onClick={(e) => handlePick(i, e)}
          >
            <Star size={size} strokeWidth={1.5} className="absolute text-[#4a4f66]" />
            <div className="absolute overflow-hidden" style={{ width: `${fillPct}%`, height: size }}>
              <Star
                size={size}
                strokeWidth={1.5}
                fill="#00F0FF"
                className="text-[#00F0FF]"
                style={{ filter: "drop-shadow(0 0 3px rgba(0,240,255,0.9)) drop-shadow(0 0 5px rgba(255,42,109,0.5))" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
