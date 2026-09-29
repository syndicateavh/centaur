import { spawn } from 'node:child_process';

const port = '3011';
const origin = `http://127.0.0.1:${port}`;
const privilegedEnvironmentKeys = new Set(['MIGRATION_DATABASE_URL', 'POSTGRES_PASSWORD', 'POSTGRES_USER', 'LMS_APP_PASSWORD']);
const runtimeEnvironment = Object.fromEntries(Object.entries(process.env).filter(([key]) => !privilegedEnvironmentKeys.has(key)));
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1'], {
  env: { ...runtimeEnvironment, NODE_ENV: 'production', LMS_AUTH_ENABLED: 'false', PORT: port },
  stdio: 'ignore',
});
let ready = false;

try {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Next.js server exited with code ${server.exitCode}.`);
    try {
      const response = await fetch(`${origin}/sign-in`);
      if (response.ok) { ready = true; break; }
    } catch { /* Wait for the local server to accept connections. */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Next.js server did not become ready.');

  for (const pathname of ['/dashboard', '/account']) {
    const response = await fetch(`${origin}${pathname}`, { redirect: 'manual' });
    if (response.status !== 307 && response.status !== 308) throw new Error(`Anonymous ${pathname} request returned ${response.status}, expected a redirect.`);
    const location = response.headers.get('location') ?? '';
    if (!location.includes('/sign-in') || !location.includes('disabled=1')) throw new Error(`Anonymous ${pathname} request did not redirect to disabled sign-in.`);
  }
  const signup = await fetch(`${origin}/api/auth/sign-up/email`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  if (signup.status !== 404) throw new Error(`Production sign-up endpoint returned ${signup.status}, expected 404 while auth is disabled.`);
  console.log('Anonymous learner routes redirect to sign-in; production sign-up API is disabled until explicitly configured.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Route authorization check failed.');
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
}
