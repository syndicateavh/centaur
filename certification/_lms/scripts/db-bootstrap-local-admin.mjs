import pg from 'pg';

if (!process.env.NODE_ENV || !process.env.DATABASE_URL) {
  try { process.loadEnvFile('.env'); } catch {}
}
if (!process.env.MIGRATION_DATABASE_URL) {
  try { process.loadEnvFile('.env.migration'); } catch {}
}

const email = process.argv[2]?.trim().toLowerCase();
if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run db:bootstrap:local-admin -- verified-local-email@example.invalid');
  process.exit(1);
}
if (process.env.NODE_ENV !== 'development') {
  console.error('Local admin bootstrap is available only when NODE_ENV=development.');
  process.exit(1);
}

const connectionString = process.env.MIGRATION_DATABASE_URL;
if (!connectionString) {
  console.error('MIGRATION_DATABASE_URL is required; copy .env.migration.example to .env.migration.');
  process.exit(1);
}
const connection = new URL(connectionString);
if (!['localhost', '127.0.0.1', '::1'].includes(connection.hostname)
  || connection.port !== '54322' || connection.pathname !== '/centaur_lms') {
  console.error('Refusing admin bootstrap outside the localhost centaur_lms database on port 54322.');
  process.exit(1);
}

const client = new pg.Client({ connectionString, connectionTimeoutMillis: 4000 });
try {
  await client.connect();
  await client.query('BEGIN');
  const account = await client.query(`SELECT id FROM lms."user"
    WHERE lower(email)=lower($1) AND "emailVerified"=TRUE FOR UPDATE`, [email]);
  if (!account.rowCount) throw new Error('No verified local account matches that email address.');
  const userId = account.rows[0].id;
  const role = await client.query(`INSERT INTO lms.user_roles(user_id,role)
    VALUES($1,'admin') ON CONFLICT(user_id,role) DO NOTHING RETURNING user_id`, [userId]);
  if (role.rowCount) {
    await client.query(`INSERT INTO lms.audit_events(actor_user_id,action,target_type,target_id,details)
      VALUES($1::uuid,'admin.role_bootstrapped','user',($1::uuid)::text,jsonb_build_object('role','admin','environment','local'))`, [userId]);
  }
  await client.query('COMMIT');
  console.log(role.rowCount ? 'Local admin role granted to the verified account and recorded in the audit log.' : 'The verified account already has the local admin role.');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(error instanceof Error ? error.message : 'Local admin bootstrap failed.');
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
