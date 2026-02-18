import { readFileSync } from 'fs';
import { sql, desc } from 'drizzle-orm';
import { pgTable, text, integer, primaryKey } from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

try {
  const envLocal = readFileSync('.env.local', 'utf8');
  for (const line of envLocal.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
} catch {}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) { console.error('No DATABASE_URL'); process.exit(1); }

const standings = pgTable('standings', {
  tournamentId: text('tournament_id').notNull(),
  player: text('player').notNull(),
  deckId: text('deck_id'),
  leaderName: text('leader_name'),
  leaderSet: text('leader_set'),
  leaderNumber: text('leader_number'),
}, (t) => [primaryKey({ columns: [t.tournamentId, t.player], name: 'standings_pk' })]);

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

const shares = await db
  .select({
    deckId: standings.deckId,
    leaderName: sql`min(${standings.leaderName})`,
    count: sql`count(*)`,
  })
  .from(standings)
  .where(sql`${standings.deckId} is not null`)
  .groupBy(standings.deckId)
  .orderBy(sql`count(*) desc`);

console.log('Raw top 10 from DB:');
for (const s of shares.slice(0, 10)) {
  console.log(`  ${s.deckId}: count=${s.count} (type: ${typeof s.count})`);
}

const total = shares.reduce((sum, s) => sum + Number(s.count), 0);
console.log(`\nTotal entries: ${total}`);
console.log('\nPercentages (top 10):');
for (const s of shares.slice(0, 10)) {
  const count = Number(s.count);
  const pct = (count / total * 100).toFixed(1);
  console.log(`  ${s.leaderName}: ${count} entries = ${pct}%`);
}

await client.end();
