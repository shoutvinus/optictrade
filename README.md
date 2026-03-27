# OpticTrade v1.0

Options trading terminal — track, analyze, and optimize your premium selling strategy.

## Quick Deploy to Vercel (5 minutes)

### Option A: Deploy via GitHub (recommended)

1. **Create a GitHub repo:**
   - Go to github.com → New Repository → name it `optictrade`
   - Upload all these files (drag & drop the whole folder)

2. **Connect to Vercel:**
   - Go to vercel.com → Sign up with GitHub
   - Click "New Project" → Import your `optictrade` repo
   - Framework: Vite (auto-detected)
   - Click "Deploy"

3. **Done.** Vercel gives you a URL like `optictrade-xyz.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
cd optictrade
npm install
vercel
```

Follow the prompts. Takes 2 minutes.

### Option C: Deploy on Replit

1. Go to replit.com → Create new Repl → Import from GitHub (or upload files)
2. In the shell: `npm install && npm run dev`
3. Replit auto-deploys with a public URL

## Run Locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Project Structure

```
optictrade/
├── index.html          # Entry point (PWA-ready meta tags)
├── package.json        # Dependencies (React + Vite)
├── vite.config.js      # Build config
├── src/
│   ├── main.jsx        # React mount
│   └── App.jsx         # Entire app (single file)
```

## Data Storage

Currently uses `localStorage` — data persists per browser/device.
Use Settings → Export JSON to back up or transfer between devices.

## Phase 2 Roadmap (Supabase)

To add cloud sync + multi-device + user accounts:
1. Create a free Supabase project
2. Create a `trades` table matching the trade schema
3. Swap localStorage calls in App.jsx to Supabase client
4. Add auth (Supabase has built-in email/Google login)
5. Redeploy

The app architecture is already designed for this swap — the storage layer is isolated in 5 functions at the top of App.jsx.
