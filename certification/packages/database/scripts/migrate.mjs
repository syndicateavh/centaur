import { existsSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const journalPath = new URL('../drizzle/meta/_journal.json', import.meta.url);
const journal = existsSync(journalPath) ? JSON.parse(readFileSync(journalPath, 'utf8')) : null;

if (!journal || journal.entries.length === 0) {
  console.info('No Drizzle migrations exist yet; domain schema migrations are added with their implementation phases.');
  process.exit(0);
}

execSync('npm run db:migrate:apply', { stdio: 'inherit' });
