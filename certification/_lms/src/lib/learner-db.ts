import "server-only";
import type { PoolClient } from "pg";
import { getDatabasePool } from "@/lib/db";

/** Run learner-owned queries with a server-validated identity and transaction-local RLS context. */
export async function withLearnerTransaction<T>(learnerId: string, work: (client: PoolClient) => Promise<T>) {
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('lms.current_learner_id', $1, true)", [learnerId]);
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
