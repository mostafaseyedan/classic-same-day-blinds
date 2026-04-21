import { Pool } from "pg";

import { opsApiEnv } from "../config.js";

let pool: Pool | null = null;

export function getOpsDbPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: opsApiEnv.databaseUrl,
    });
  }

  return pool;
}
