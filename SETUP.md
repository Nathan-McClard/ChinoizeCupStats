# ChinoizeStats Setup Guide

Complete guide to get ChinoizeStats running locally and deployed to Netlify.

---

## Prerequisites

- **Node.js 20+** ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([download](https://git-scm.com/))
- A **Supabase** account (free tier works) — [supabase.com](https://supabase.com/)
- A **Netlify** account (free tier works) — [netlify.com](https://www.netlify.com/)

---

## 1. Install Dependencies

```bash
cd D:\_Projects\ChinoizeStats
npm install
```

---

## 2. Set Up Supabase Database

Supabase provides a managed PostgreSQL database. The free tier includes 500 MB storage and 2 projects.

### 2a. Create a new Supabase project

1. Go to [app.supabase.com](https://app.supabase.com/)
2. Click **"New Project"**
3. Fill in:
   - **Name:** `chinoizestats` (or whatever you like)
   - **Database Password:** Choose a strong password — **save this**, you'll need it
   - **Region:** Pick one close to your Netlify deployment region
4. Click **"Create new project"**
5. Wait for the project to finish provisioning (~2 minutes)

### 2b. Get your connection string

1. In your Supabase project dashboard, go to **Settings** (gear icon) > **Database**
2. Scroll to **Connection string** section
3. Select the **URI** tab
4. Copy the connection string — it looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
5. **Important:** Replace `[YOUR-PASSWORD]` in the string with the database password you set in step 2a

#### Which connection string to use?

Supabase offers multiple connection modes. For this project:

- **Transaction mode (port 6543)** — Use this one. It works with serverless/Netlify functions. This is the default shown under "Connection string".
- Session mode (port 5432) — Not needed for this project.
- Direct connection (port 5432) — Only needed for running migrations locally. See step 3 below.

### 2c. Update `.env.local`

Open `.env.local` and fill in the values:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
LIMITLESS_API_BASE_URL=(see Limitless TCG API docs)
CRON_SECRET=any-random-secret-string-you-choose
```

For `CRON_SECRET`, generate any random string. This protects the sync API endpoint from unauthorized access. Example:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Push the Database Schema

This creates all the tables in your Supabase PostgreSQL database.

**Important:** For schema push/migrations, you need the **direct connection string** (not the pooler). In Supabase:

1. Go to **Settings** > **Database** > **Connection string**
2. Switch to **URI** tab, then find "Direct connection" or change the port to `5432` and the host to the direct host
3. Alternatively, just change port `6543` to `5432` in your connection string and use the direct host shown in the dashboard

Run the push using the direct connection:

```bash
# Option A: If your .env.local DATABASE_URL uses the direct connection
npm run db:push

# Option B: Override just for this command
DATABASE_URL="postgresql://postgres.[ref]:[password]@db.[ref].supabase.co:5432/postgres" npm run db:push
```

You should see output confirming tables were created:
- `tournaments`
- `standings`
- `decklist_cards`
- `pairings`
- `sync_log`

### Verify in Supabase Dashboard

1. Go to your Supabase project
2. Click **Table Editor** in the sidebar
3. You should see all 5 tables listed

### Using Drizzle Studio (optional)

```bash
npm run db:studio
```

This opens a web UI at `https://local.drizzle.studio` where you can browse your tables. (Also requires the direct connection string.)

---

## 4. Sync Tournament Data

### First sync (local)

Start the dev server, then trigger a sync:

```bash
# Terminal 1: start the dev server
npm run dev
```

```bash
# Terminal 2: trigger the sync
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

**On Windows (PowerShell):**
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/sync" `
  -Headers @{ Authorization = "Bearer YOUR_CRON_SECRET"; "Content-Type" = "application/json" }
```

Replace `YOUR_CRON_SECRET` with the value you set in `.env.local`.

### What the sync does

1. **Discovers tournaments** — Fetches One Piece tournaments from the Limitless TCG API and filters for ChinoizeCup events
2. **Syncs details** — For up to 5 tournaments per call, fetches standings, decklists, and pairings
3. **Stores everything** — Batch-inserts data into Supabase with conflict handling

The sync is idempotent — running it multiple times is safe.

### Sync a single tournament

If you know a specific tournament ID:

```bash
curl -X POST http://localhost:3000/api/sync/TOURNAMENT_ID \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Re-run sync for more tournaments

The initial sync processes up to 5 tournaments. Run it again to sync the next batch:

```bash
# Keep calling until all tournaments are synced
curl -X POST http://localhost:3000/api/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Pages available

| Route | Description |
|-------|------------|
| `/` | Dashboard — stat cards, meta pie chart, recent results |
| `/tournaments` | Tournament history grid |
| `/tournaments/[id]` | Tournament detail — standings + meta distribution |
| `/tier-list` | Leader tier list (S/A/B/C) |
| `/leaders/[deckId]` | Leader detail — performance, matchups, card inclusion |
| `/decklists` | Decklist browser with filters |
| `/cards` | Card analytics — most played cards |
| `/trends` | Meta trends — share over time, win rates, diversity |

---

## 6. Deploy to Netlify

### 6a. Initialize Git (if not already)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 6b. Push to GitHub

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/ChinoizeStats.git
git branch -M main
git push -u origin main
```

### 6c. Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com/)
2. Click **"Add new site"** > **"Import an existing project"**
3. Select **GitHub** and authorize access
4. Choose your `ChinoizeStats` repository
5. Netlify will auto-detect the settings from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. Click **"Deploy site"**

### 6d. Set environment variables

In Netlify dashboard: **Site settings** > **Environment variables** > **Add a variable**

Add all three:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Supabase **transaction mode** connection string (port 6543) |
| `LIMITLESS_API_BASE_URL` | `(see Limitless TCG API docs)` |
| `CRON_SECRET` | Same secret you used locally |

### 6e. Redeploy

After setting env vars, trigger a new deploy:
- **Deploys** tab > **Trigger deploy** > **Deploy site**

### 6f. Trigger initial sync on production

Once deployed, sync data on production:

```bash
curl -X POST https://YOUR-SITE.netlify.app/api/sync \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Run this a few times until all tournaments are synced.

---

## 7. Automatic Daily Sync

The project includes a Netlify scheduled function at `netlify/functions/scheduled-sync.mts` that runs daily at **6:00 AM UTC**.

This is automatic — no setup needed beyond deployment. Netlify detects the scheduled function from the `config.schedule` export.

### Verify it's registered

In Netlify dashboard: **Functions** tab — you should see `scheduled-sync` listed with its cron schedule.

### Manual trigger

You can also trigger the scheduled function manually from the Netlify dashboard Functions tab, or by calling the sync API endpoint directly.

---

## Project Structure

```
ChinoizeStats/
├── .env.local                # Local environment variables (not committed)
├── drizzle.config.ts         # Drizzle ORM config for PostgreSQL
├── netlify.toml              # Netlify build & plugin config
├── next.config.ts            # Next.js configuration
├── postcss.config.mjs        # PostCSS with Tailwind
├── tsconfig.json             # TypeScript configuration
├── netlify/
│   └── functions/
│       └── scheduled-sync.mts  # Daily cron job
└── src/
    ├── app/                  # Next.js App Router pages
    │   ├── page.tsx          # Dashboard (/)
    │   ├── layout.tsx        # Root layout with sidebar
    │   ├── globals.css       # Theme & custom utilities
    │   ├── api/sync/         # Sync API endpoints
    │   ├── cards/            # Card analytics page
    │   ├── decklists/        # Decklist browser page
    │   ├── leaders/[deckId]/ # Leader detail page
    │   ├── tier-list/        # Tier list page
    │   ├── tournaments/      # Tournament list + detail pages
    │   └── trends/           # Meta trends page
    ├── components/
    │   ├── ui/               # shadcn/ui + custom components
    │   ├── layout/           # Sidebar, header
    │   ├── dashboard/        # Dashboard-specific components
    │   ├── tier-list/        # Tier list components
    │   ├── leaders/          # Leader detail components
    │   ├── decklists/        # Decklist components
    │   ├── cards/            # Card analytics components
    │   ├── trends/           # Trends chart components
    │   └── tournaments/      # Tournament components
    └── lib/
        ├── db/               # Supabase/PostgreSQL client & schema
        ├── limitless/        # Limitless TCG API client
        ├── sync/             # Data sync service
        ├── queries/          # Database query functions
        └── charts/           # Recharts theme config
```

---

## Available Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server locally |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema changes to Supabase (use direct connection) |
| `npm run db:studio` | Open Drizzle Studio (database browser) |

---

## Troubleshooting

### "DATABASE_URL environment variable is not set"

Make sure `.env.local` has a valid `DATABASE_URL`. For Netlify, make sure the environment variable is set in the dashboard.

### "prepared statement already exists" or connection pool errors

The `postgres` driver is configured with `prepare: false` which is required for Supabase's transaction-mode pooler (port 6543). If you see prepared statement errors, verify you're using port 6543 in your connection string.

### "password authentication failed"

Double-check that you replaced `[YOUR-PASSWORD]` in the Supabase connection string with your actual database password. If you forgot the password, reset it in Supabase: **Settings** > **Database** > **Database password** > **Reset**.

### Schema push fails with connection error

Schema push (`npm run db:push`) requires the **direct connection** (port 5432), not the pooler (port 6543). Use the direct connection string from Supabase dashboard for this command.

### Sync returns empty tournaments

The Limitless TCG API filters for tournaments with "chinoize" in the name. If the tournament naming convention changes, update the filter in `src/lib/limitless/client.ts` line 46.

### "Unauthorized" when calling /api/sync

Make sure the `Authorization` header matches: `Bearer YOUR_CRON_SECRET` (with the `Bearer ` prefix and a space).

### Build fails with TypeScript errors

```bash
npm run build
```

If there are type errors, they'll be shown in the output. The project was verified to build cleanly — if errors appear after modifications, check the specific file and line referenced.

### Scheduled function not appearing in Netlify

Make sure the file is at exactly `netlify/functions/scheduled-sync.mts` (not `.ts`). The `.mts` extension is required for ESM Netlify functions.

---

## Updating the Schema

If you modify `src/lib/db/schema.ts`:

```bash
# Use direct connection string for schema changes
npm run db:push
```

This will apply changes directly to your Supabase database. For production, consider using Drizzle migrations instead:

```bash
npx drizzle-kit generate   # Generate migration SQL
npx drizzle-kit migrate     # Apply migrations
```

---

## Tech Stack Reference

| Layer | Technology | Docs |
|-------|-----------|------|
| Framework | Next.js 16 (App Router) | https://nextjs.org/docs |
| Styling | Tailwind CSS v4 | https://tailwindcss.com/docs |
| Components | shadcn/ui | https://ui.shadcn.com |
| Animations | Framer Motion | https://motion.dev |
| Database | Supabase (PostgreSQL) | https://supabase.com/docs |
| ORM | Drizzle ORM | https://orm.drizzle.team |
| Charts | Recharts | https://recharts.org |
| Data Source | Limitless TCG API | https://play.limitlesstcg.com |
| Hosting | Netlify | https://docs.netlify.com |
