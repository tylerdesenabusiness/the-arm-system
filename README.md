# The Arm System

Rate every college QB start, Letterboxd-style. This is a complete, working Next.js + Supabase app — the code is done. What's left are the steps only you can do (creating your own accounts and pasting in your own keys).

## What's already built
- Full site: home feed, player pages, game pages, star ratings, reviews
- Real database schema (`supabase-schema.sql`)
- Real auth (magic-link email login)
- Real data ingestion script pulling actual games from CollegeFootballData.com

## What you need to do (~20 minutes)

1. **Create 4 free accounts**: github.com, vercel.com, supabase.com, collegefootballdata.com/key

2. **Create a Supabase project** (supabase.com/dashboard → New Project). Once created:
   - Go to SQL Editor → New query → paste the entire contents of `supabase-schema.sql` → Run
   - Go to Project Settings → API → copy your **Project URL** and **anon public** key

3. **Set up your environment**: copy `.env.local.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your project url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your anon key
   CFBD_API_KEY=your CFBD key
   ```

4. **Install and run locally**:
   ```bash
   npm install
   npm run ingest    # pulls real games into your database
   npm run dev        # open http://localhost:3000
   ```

5. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "the arm system"
   git remote add origin https://github.com/YOUR_USERNAME/the-arm-system.git
   git branch -M main
   git push -u origin main
   ```

6. **Deploy on Vercel**: vercel.com → Add New Project → pick your repo → add the same 3 environment variables from `.env.local` → Deploy. You'll get a live URL in a couple minutes.

7. **Keep it updated automatically**: in your GitHub repo → Settings → Secrets and variables → Actions, add three secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CFBD_API_KEY` (same values as your `.env.local`). The included GitHub Action (`.github/workflows/ingest.yml`) will then run the ingestion script automatically every Monday during the season.

## Adjusting which teams get tracked
Edit `INGEST_TEAMS` in `.env.local` (and the matching GitHub secret) — comma-separated school names exactly as CFBD names them, e.g. `Texas,Ohio State,Notre Dame`.

## If something breaks
- **Ingestion pulls no QBs for a game**: CFBD's response shape can shift. Add `console.log(JSON.stringify(playerStats[0], null, 2))` in `scripts/ingest.js` right after it's fetched, run again, and check the actual shape against the parsing logic.
- **"relation does not exist" errors**: the SQL schema didn't run — go back to Supabase SQL Editor and re-run `supabase-schema.sql`.
- **Ratings won't save**: make sure you're signed in (magic link), and that Row Level Security policies from the schema file were applied.
