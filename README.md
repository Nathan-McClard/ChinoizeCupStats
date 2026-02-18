# ChinoizeStats

Tournament analytics platform for **ChinoizeCup** One Piece TCG events. Track leader performance, explore decklists, analyze matchups, and follow the competitive meta.

## Features

- **Tier List** -- Leaders ranked by composite score with progressive visual hierarchy
- **Leader Detail** -- Per-leader stats, matchup heatmap, performance trends, and top decklists
- **Archetype Explorer** -- Decklists grouped by identical card composition with aggregated win rates and pilot history
- **Matchup Data** -- Head-to-head win rates across all tracked tournaments
- **Player Profiles** -- Individual tournament history and performance records
- **Card Analytics** -- Most-played cards across the meta with inclusion rates
- **Meta Trends** -- Historical play rate and win rate charts over time
- **Format Detection** -- Automatically detects the current format based on new set card appearances in decklists

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **UI**: [Radix UI](https://www.radix-ui.com/) primitives, [Lucide](https://lucide.dev/) icons
- **Hosting**: [Netlify](https://www.netlify.com/)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/chinoizestats.git
   cd chinoizestats
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file with your database connection:
   ```
   DATABASE_URL=postgres://user:password@host:5432/chinoizestats
   ```

4. Push the schema to your database:
   ```bash
   npm run db:push
   ```

5. Sync tournament data:
   ```bash
   npm run sync        # Sync recent tournaments
   npm run sync:all    # Sync all tournaments
   ```

6. Start the dev server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run sync` | Sync recent tournament data |
| `npm run sync:all` | Sync all tournament data |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Drizzle Studio |

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    page.tsx            # Homepage -- bento grid with key stats
    tier-list/          # Leader tier rankings
    leaders/[deckId]/   # Individual leader detail
    decklists/          # Archetype explorer & decklist viewer
    players/            # Player profiles & standings
    cards/              # Card analytics
    trends/             # Historical meta trends
    tournaments/        # Tournament list & detail
    api/                # Data sync endpoints
  components/           # React components organized by feature
    ui/                 # Shared UI primitives
  lib/
    db/                 # Drizzle schema & connection
    queries/            # Data access layer
    charts/             # Chart theming
```

## License

This project is not affiliated with or endorsed by Bandai Namco or the One Piece TCG.
