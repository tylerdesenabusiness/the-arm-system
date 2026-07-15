// Fallback color palette for known programs. Any team not listed here
// (e.g. a smaller opponent pulled in from CFBD) falls back to DEFAULT_COLORS.
export const TEAM_COLORS = {
  Texas: { primary: "#BF5700", secondary: "#333F48" },
  "Ohio State": { primary: "#BB0000", secondary: "#666666" },
  Georgia: { primary: "#BA0C2F", secondary: "#000000" },
  Alabama: { primary: "#9E1B32", secondary: "#828A8F" },
  Michigan: { primary: "#00274C", secondary: "#FFCB05" },
  Oregon: { primary: "#154733", secondary: "#FEE123" },
  LSU: { primary: "#461D7C", secondary: "#FDD023" },
  Miami: { primary: "#F47321", secondary: "#005030" },
  Clemson: { primary: "#F56600", secondary: "#522D80" },
  Nebraska: { primary: "#E41C38", secondary: "#F5F1E7" },
  Florida: { primary: "#0021A5", secondary: "#FA4616" },
};

export const DEFAULT_COLORS = { primary: "#333B44", secondary: "#14181C" };

export function teamColors(name) {
  return TEAM_COLORS[name] || DEFAULT_COLORS;
}

export function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function shortCode(name) {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return words.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
  }
  return name.slice(0, 3).toUpperCase();
}
