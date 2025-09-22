export interface Env {
  DB?: D1Database; // Optional for Cloudflare
  DATABASE_URL?: string; // For MySQL connection
  ADMIN_ACCESS_TOKEN: string;
}
