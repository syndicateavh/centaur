import dotenv from 'dotenv';
import { eq, sql } from 'drizzle-orm';
import { createDatabase, bootstrapEvents, roles, userRoles, users } from '@centaur/lms-database';
import { emailSchema } from '@centaur/lms-shared';

dotenv.config({ path: '../../.env' });

function emailArgument() {
  const args = process.argv.slice(2);
  const emailIndex = args.indexOf('--email');
  const candidate = emailIndex >= 0 ? args[emailIndex + 1] : undefined;
  if (!candidate) throw new Error('Usage: npm run bootstrap:super-admin -- --email existing-user@example.com');
  return emailSchema.parse(candidate).trim().toLowerCase();
}

async function bootstrap() {
  const email = emailArgument();
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL must be configured.');

  const database = createDatabase(databaseUrl);
  try {
    await database.db.transaction(async (transaction) => {
      await transaction.execute(sql`SELECT pg_advisory_xact_lock(7410020261006)`);

      const [completed] = await transaction.select({ key: bootstrapEvents.key })
        .from(bootstrapEvents)
        .where(eq(bootstrapEvents.key, 'initial_super_admin'))
        .limit(1);
      if (completed) throw new Error('The initial SUPER_ADMIN bootstrap has already been completed.');

      const [existingAdmin] = await transaction.select({ id: userRoles.userId })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(roles.code, 'SUPER_ADMIN'))
        .limit(1);
      if (existingAdmin) throw new Error('A SUPER_ADMIN is already assigned; refusing to bootstrap another account.');

      const [user] = await transaction.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (!user) throw new Error(`No account exists for ${email}. Register the account before bootstrapping it.`);

      const [adminRole] = await transaction.select({ id: roles.id }).from(roles)
        .where(eq(roles.code, 'SUPER_ADMIN'))
        .limit(1);
      if (!adminRole) throw new Error('SUPER_ADMIN role is missing. Apply database migrations first.');

      await transaction.insert(userRoles).values({ userId: user.id, roleId: adminRole.id });
      await transaction.insert(bootstrapEvents).values({ key: 'initial_super_admin', userId: user.id });
    });
    console.info(`Assigned SUPER_ADMIN to ${email}. The one-time bootstrap is recorded.`);
  } finally {
    await database.client.end();
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'SUPER_ADMIN bootstrap failed.');
  process.exitCode = 1;
});
