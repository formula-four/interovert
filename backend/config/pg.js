import { Pool } from 'pg';
import env from './env.js';

let pool;
let pgHealthy = true;
let healthCheckTimer = null;
const HEALTH_RECHECK_MS = 30_000;

export function hasPostgresConfig() {
  return Boolean(env.pgHost && env.pgUser && env.pgDatabase);
}

function scheduleHealthRecheck() {
  if (healthCheckTimer) return;
  healthCheckTimer = setTimeout(async () => {
    healthCheckTimer = null;
    if (!pool) return;
    try {
      await pool.query('SELECT 1');
      pgHealthy = true;
      console.log('[pg] reconnected successfully');
    } catch {
      pgHealthy = false;
      scheduleHealthRecheck();
    }
  }, HEALTH_RECHECK_MS);
}

export function markPgUnhealthy() {
  pgHealthy = false;
  scheduleHealthRecheck();
}

export function getPgPool() {
  if (!hasPostgresConfig()) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      host: env.pgHost,
      port: env.pgPort,
      user: env.pgUser,
      password: env.pgPassword,
      database: env.pgDatabase,
      ssl: env.pgSsl ? { rejectUnauthorized: false } : false,
      max: 10,
    });

    pool.on('error', () => {
      pgHealthy = false;
      scheduleHealthRecheck();
    });
  }

  if (!pgHealthy) return null;

  return pool;
}
