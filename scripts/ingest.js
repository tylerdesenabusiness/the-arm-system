const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CFBD_KEY = process.env.CFBD_API_KEY;
const SEASON = Number(process.env.INGEST_SEASON || 2025);

const QB_ROSTER = [
  { name: "Arch Manning", currentTeam: "Texas", historicalTeam: "Texas" },
  { name: "Julian Sayin", currentTeam: "Ohio State", historicalTeam: "Ohio State" },
  { name: "Gunner Stockton", currentTeam: "Georgia", historicalTeam: "Georgia" },
  { name: "Austin Mack", currentTeam: "Alabama", historicalTeam: "Alabama" },
  { name: "Keelon Russell", currentTeam: "Alabama", historicalTeam: "Alabama" },
  { name: "Sam Leavitt", currentTeam: "LSU", historicalTeam: "Arizona State" },
  { name: "Christopher Vizzina", currentTeam: "Clemson", historicalTeam: "Clemson" },
  { name: "Dante Moore", currentTeam: "Oregon", historicalTeam: "Oregon" },
  { name: "CJ Carr", currentTeam: "Notre Dame", historicalTeam: "Notre Dame" },
  { name: "Jayden Maiava", currentTeam: "USC", historicalTeam: "USC" },
  { name: "LaNorris Sellers", currentTeam: "South Carolina", historicalTeam: "South Carolina" },
  { name: "Marcel Reed", currentTeam: "Texas A&M", historicalTeam: "Texas A&M" },
  { name: "Darian Mensah", currentTeam: "Miami", historicalTeam: "Duke" },
  { name: "Byrum Brown", currentTeam: "Auburn", historicalTeam: "Auburn" },
  { name: "Rocco Becht", currentTeam: "Penn State", historicalTeam: "Iowa State" },
  { name: "John Mateer", currentTeam: "Oklahoma", historicalTeam: "Oklahoma" },
  { name: "Trinidad Chambliss", currentTeam: "Ole Miss", historicalTeam: "Ole Miss" },
  { name: "Bryce Underwood", currentTeam: "Michigan", historicalTeam: "Michigan" },
  { name: "Ethan Grunkemeyer", currentTeam: "Virginia Tech", historicalTeam: "Penn State" },
  { name: "Jaylen Raynor", currentTeam: "Iowa State", historicalTeam: "Arkansas State" },
  { name: "Beau Pribula", currentTeam: "Virginia", historicalTeam: "Missouri" },
  { name: "Austin Simmons", currentTeam: "Missouri", historicalTeam: "Ole Miss" },
  { name: "Aidan Chiles", currentTeam: "Northwestern", historicalTeam: "Michigan State" },
  { name: "Avery Johnson", currentTeam: "Kansas State", historicalTeam: "Kansas State" },
  { name: "Kenny Minchey", currentTeam: "Kentucky", historicalTeam: "Nebraska" },
  { name: "Cutter Boley", currentTeam: "Arizona State", historicalTeam: "Kentucky" },
  { name: "Julian Lewis", currentTeam: "Colorado", historicalTeam: "Colorado" },
  { name: "Bear Bachmeier", currentTeam: "BYU", historicalTeam: "BYU" },
  { name: "Alberto Mendoza", currentTeam: "Georgia Tech", historicalTeam: "Georgia Tech" },
  { name: "Aaron Philo", currentTeam: "Florida", historicalTeam: "Georgia Tech" },
  { name: "Steve Angeli", currentTeam: "Syracuse", historicalTeam: "Syracuse" },
  { name: "Alonza Barnett III", currentTeam: "UCF", historicalTeam: "UCF" },
  { name: "Gio Lopez", currentTeam: "Wake Forest", historicalTeam: "North Carolina" },
  { name: "Jaron-Keawe Sagapolutele", currentTeam: "California", historicalTeam: "California" },
  { name: "Nico Iamaleava", currentTeam: "UCLA", historicalTeam: "UCLA" },
  { name: "Josh Hoover", currentTeam: "Indiana", historicalTeam: "TCU" },
  { name: "Drake Lindsey", currentTeam: "Minnesota", historicalTeam: "Minnesota" },
  { name: "Kamario Taylor", currentTeam: "Mississippi State", historicalTeam: "Mississippi State" },
  { name: "Chase Jenkins", currentTeam: "Rice", historicalTeam: "Rice" },
];

const teamsToQuery = {};
const currentTeamByName = {};
QB_ROSTER.forEach(({ name, currentTeam, historicalTeam }) => {
  if (!teamsToQuery[historicalTeam]) teamsToQuery[historicalTeam] = [];
  teamsToQuery[historicalTeam].push(name.toLowerCase());
  currentTeamByName[name.toLowerCase()] = currentTeam;
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function cfbdGet(path, retries = 4) {
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(`https://api.collegefootballdata.com${path}`, {
      headers: { Authorization: `Bearer ${CFBD_KEY}` },
    });
    if (res.status === 429) {
      const wait = 1500 * (attempt + 1);
      console.log(`  rate limited, waiting ${wait}ms before retry...`);
      await sleep(wait);
      continue;
    }
    if (!res.ok) {
      console.error(`  CFBD request failed: ${path} -> ${res.status}`);
      return [];
    }
    await sleep(300);
    return res.json();
  }
  console.error(`  gave up after ${retries} retries: ${path}`);
  return [];
}

async function run() {
  if (!CFBD_KEY) {
    console.error("Missing CFBD_API_KEY in .env.local");
    process.exit(1);
  }

  for (const historicalTeam of Object.keys(teamsToQuery)) {
    const allowedNames = teamsToQuery[historicalTeam];
    console.log(`Fetching ${SEASON} games for ${historicalTeam}...`);
    const games = await cfbdGet(`/games?year=${SEASON}&team=${encodeURIComponent(historicalTeam)}`);

    await supabase.from("teams").upsert({ id: historicalTeam, name: historicalTeam });

    let qbGamesWritten = 0;

    for (const g of games) {
      const isHome = g.homeTeam === historicalTeam;
      const opponent = isHome ? g.awayTeam : g.homeTeam;
      if (!opponent) continue;

      await supabase.from("teams").upsert({ id: opponent, name: opponent });

      const playerStats = await cfbdGet(
        `/games/players?year=${SEASON}&week=${g.week}&team=${encodeURIComponent(historicalTeam)}&seasonType=${g.seasonType || "regular"}`
      );

      const qbNames = new Set();
      (playerStats[0]?.teams ?? [])
        .filter((t) => t.team === historicalTeam)
        .forEach((t) => {
          (t.categories ?? []).forEach((cat) => {
            if (cat.name === "passing") {
              cat.types.forEach((ty) => {
                if (ty.name === "C/ATT") {
                  ty.athletes.forEach((a) => {
                    if (allowedNames.includes(a.name.toLowerCase())) {
                      qbNames.add(a.name);
                    }
                  });
                }
              });
            }
          });
        });

      if (qbNames.size === 0) continue;

      for (const qbName of qbNames) {
        const currentTeam = currentTeamByName[qbName.toLowerCase()] || historicalTeam;

        const { data: player, error: playerErr } = await supabase
          .from("players")
          .upsert({ name: qbName, team_id: currentTeam, position: "QB" }, { onConflict: "name" })
          .select()
          .single();

        if (playerErr) {
          console.error("  player upsert failed:", playerErr.message);
          continue;
        }

        const result = g.homePoints == null || g.awayPoints == null
          ? null
          : isHome
          ? g.homePoints > g.awayPoints ? "W" : "L"
          : g.awayPoints > g.homePoints ? "W" : "L";

        const { error: gameErr } = await supabase.from("games").upsert(
          {
            player_id: player.id,
            team_id: historicalTeam,
            opponent_id: opponent,
            season: SEASON,
            week: g.week,
            season_type: g.seasonType || "regular",
            game_date: g.startDate,
            result,
            score: g.homePoints != null ? `${g.homePoints}-${g.awayPoints}` : null,
          },
          { onConflict: "player_id,season,week,season_type" }
        );
        if (gameErr) console.error("  game upsert failed:", gameErr.message);
        else qbGamesWritten++;
      }
    }
    console.log(`  -> wrote ${qbGamesWritten} QB game rows from ${historicalTeam}`);
  }
  console.log("Done.");
}

run();
