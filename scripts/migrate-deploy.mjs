import { config } from "dotenv";
import { execSync } from "node:child_process";

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

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

if (!databaseUrl || databaseUrl.includes("127.0.0.1:5432/build")) {
  console.warn(
    "[migrate-deploy] Skipping: DATABASE_URL is not set (add it in Vercel env before deploy).",
  );
  process.exit(0);
}

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} catch (error) {
  console.warn("[migrate-deploy] Failed:", error.message ?? error);
  console.warn("[migrate-deploy] Build continues — run npm run db:deploy locally or set DATABASE_URL on Vercel.");
}
