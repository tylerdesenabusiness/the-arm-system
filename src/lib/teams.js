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
  "Notre Dame": { primary: "#0C2340", secondary: "#C99700" },
  USC: { primary: "#990000", secondary: "#FFC72C" },
  "South Carolina": { primary: "#73000A", secondary: "#000000" },
  "Texas A&M": { primary: "#500000", secondary: "#FFFFFF" },
  Auburn: { primary: "#03244D", secondary: "#DD550C" },
  "Iowa State": { primary: "#C8102E", secondary: "#F1BE48" },
  Oklahoma: { primary: "#841617", secondary: "#FDF9F3" },
  "Ole Miss": { primary: "#14213D", secondary: "#CE1126" },
  "Penn State": { primary: "#041E42", secondary: "#FFFFFF" },
  "Virginia Tech": { primary: "#630031", secondary: "#CF4420" },
  Virginia: { primary: "#232D4B", secondary: "#F84C1E" },
  Missouri: { primary: "#F1B82D", secondary: "#000000" },
  Northwestern: { primary: "#4E2A84", secondary: "#FFFFFF" },
  "Kansas State": { primary: "#512888", secondary: "#A5A9AB" },
  Kentucky: { primary: "#0033A0", secondary: "#FFFFFF" },
  "Arizona State": { primary: "#8C1D40", secondary: "#FFC627" },
  Colorado: { primary: "#000000", secondary: "#CFB87C" },
  BYU: { primary: "#002E5D", secondary: "#FFFFFF" },
  "Georgia Tech": { primary: "#B3A369", secondary: "#003057" },
  Syracuse: { primary: "#D44500", secondary: "#000E54" },
  UCF: { primary: "#000000", secondary: "#BA9B37" },
  "Wake Forest": { primary: "#9E7E38", secondary: "#000000" },
  "North Carolina": { primary: "#7BAFD4", secondary: "#FFFFFF" },
  California: { primary: "#003262", secondary: "#FDB515" },
  UCLA: { primary: "#2D68C4", secondary: "#F2A900" },
  TCU: { primary: "#4D1979", secondary: "#A3A9AC" },
  Indiana: { primary: "#990000", secondary: "#EEEDEB" },
  Minnesota: { primary: "#7A0019", secondary: "#FFCC33" },
  "Mississippi State": { primary: "#660000", secondary: "#FFFFFF" },
  Rice: { primary: "#00205B", secondary: "#C1C6C8" },
  "North Texas": { primary: "#00853E", secondary: "#000000" },
  "NC State": { primary: "#CC0000", secondary: "#000000" },
  Wisconsin: { primary: "#C5050C", secondary: "#FFFFFF" },
  Maryland: { primary: "#E03A3E", secondary: "#FFD520" },
  Houston: { primary: "#C8102E", secondary: "#76232F" },
  Harvard: { primary: "#A51C30", secondary: "#FFFFFF" },
  Cincinnati: { primary: "#000000", secondary: "#E00122" },
  "Florida State": { primary: "#782F40", secondary: "#CEB888" },
  Stanford: { primary: "#8C1515", secondary: "#FFFFFF" },
  Baylor: { primary: "#154734", secondary: "#FFB81C" },
  Purdue: { primary: "#000000", secondary: "#CEB888" },
  "Michigan State": { primary: "#18453B", secondary: "#FFFFFF" },
  "Boston College": { primary: "#98002E", secondary: "#BC9B6A" },
  Rutgers: { primary: "#CC0033", secondary: "#000000" },
  Vanderbilt: { primary: "#000000", secondary: "#866D4B" },
  Illinois: { primary: "#13294B", secondary: "#E84A27" },
  "West Virginia": { primary: "#002855", secondary: "#EAAA00" },
  Pittsburgh: { primary: "#003594", secondary: "#FFB81C" },
  "Boise State": { primary: "#0033A0", secondary: "#D64309" },
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Any team not in the curated list above still gets a real, vivid, distinct
// color (deterministic per team name) instead of flat gray.
function fallbackColors(name) {
  const hash = hashString(name || "team");
  const hue = hash % 360;
  return {
    primary: `hsl(${hue}, 70%, 45%)`,
    secondary: `hsl(${(hue + 45) % 360}, 55%, 28%)`,
  };
}

export const DEFAULT_COLORS = { primary: "#333B44", secondary: "#14181C" };

export function teamColors(name) {
  if (!name) return DEFAULT_COLORS;
  return TEAM_COLORS[name] || fallbackColors(name);
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
