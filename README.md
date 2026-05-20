# How Nigerian Are You? 🇳🇬

A viral Nigerian travel quiz — find out how many of Nigeria's 37 states/FCT you've visited.

## Deploy in 5 minutes

### Option A — Vercel (recommended)
1. Push this repo to GitHub
2. Go to vercel.com → New Project → Import your repo
3. Vercel auto-detects Next.js. Click Deploy.
4. Done. Your URL is live.

### Option B — Local dev
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Option C — Manual Vercel CLI
```bash
npm install
npm run build
npx vercel deploy
```

## Features
- 37 states + FCT Abuja — randomised order every session
- Colour-coded grid map by geo-political zone
- Dynamic funny titles per score band
- Zone breakdown with progress bars
- Bucket list of unvisited states
- Share to X/Twitter, WhatsApp, Telegram, Facebook
- Challenge links (encodes your score in URL)
- Leaderboard stored in browser localStorage
- Result persists across refreshes and in-app browsers
- Confetti for high scores
- No login, no database required

## Upgrade to global leaderboard (optional)
1. Create a free Supabase project at supabase.com
2. Create table: `scores (id uuid, nickname text, score int, ts bigint)`
3. In components/Game.jsx, find the two functions marked `SUPABASE_SWAP`
4. Replace with Supabase client calls using your project URL + anon key
