import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config();

function normalizeDatabaseUrl(raw) {
  if (!raw) return undefined;
  let url = String(raw).trim();
  if (
    (url.startsWith("'") && url.endsWith("'")) ||
    (url.startsWith('"') && url.endsWith('"'))
  ) {
    url = url.slice(1, -1).trim();
  }
  return url || undefined;
}

// `prisma generate` does not connect to the DB. A placeholder avoids build failures
// when DATABASE_URL is missing during Vercel install (set it in Vercel env for runtime).
const databaseUrl =
  normalizeDatabaseUrl(process.env.DATABASE_URL) ||
  "postgresql://build:build@127.0.0.1:5432/build?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
