import { defineConfig } from "prisma/config";

// `prisma generate` does not connect to the DB. A placeholder avoids build failures
// when DATABASE_URL is missing during Vercel install (set it in Vercel env for runtime).
const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://build:build@127.0.0.1:5432/build?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});
