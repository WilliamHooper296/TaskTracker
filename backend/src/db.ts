import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  maxLifetimeSeconds: 1800,
  idleTimeoutMillis: 30000,
});

export default pool;
