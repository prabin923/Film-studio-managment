/**
 * Push DATABASE_URL from .env to Vercel (production, preview, development).
 * Requires: npx vercel login && vercel link
 */
import { config } from "dotenv";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
config({ path: join(root, ".env") });

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

if (!databaseUrl) {
  console.error("DATABASE_URL missing in .env");
  process.exit(1);
}

for (const target of ["production", "preview", "development"]) {
  console.log(`Setting DATABASE_URL on Vercel (${target})…`);
  try {
    execSync(`npx vercel env rm DATABASE_URL ${target} --yes`, { stdio: "ignore", cwd: root });
  } catch {
    /* not set yet */
  }
  execSync(`npx vercel env add DATABASE_URL ${target}`, {
    input: databaseUrl,
    stdio: ["pipe", "inherit", "inherit"],
    cwd: root,
  });
}

console.log("Done. Redeploy on Vercel for changes to apply.");
