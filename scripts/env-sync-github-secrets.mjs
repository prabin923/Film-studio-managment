/**
 * Push DATABASE_URL from local .env to GitHub repository secrets (for Actions / Vercel workflows).
 * Requires: gh auth login, DATABASE_URL in .env
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
const repo = process.env.GITHUB_REPO || "prabin923/Film-studio-managment";

if (!databaseUrl) {
  console.error("DATABASE_URL is missing in .env. Run npm run env:pull and set it first.");
  process.exit(1);
}

try {
  execSync("gh auth status", { stdio: "ignore" });
} catch {
  console.error("GitHub CLI not logged in. Run: gh auth login");
  process.exit(1);
}

console.log(`Setting DATABASE_URL secret on ${repo}…`);

execSync(`gh secret set DATABASE_URL --repo ${repo}`, {
  input: databaseUrl,
  stdio: ["pipe", "inherit", "inherit"],
});

console.log("Done. Redeploy Vercel or run the deploy workflow so production picks it up.");
