/**
 * Download .env.example from GitHub and create .env if missing.
 * Real secrets are NOT stored in the repo — fill DATABASE_URL locally or use GitHub Secrets.
 */
import { execSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const examplePath = join(root, ".env.example");
const envPath = join(root, ".env");

const repo = process.env.GITHUB_REPO || "prabin923/Film-studio-managment";
const branch = process.env.GITHUB_BRANCH || "main";
const rawUrl = `https://raw.githubusercontent.com/${repo}/${branch}/.env.example`;

console.log(`Fetching .env.example from GitHub (${repo}@${branch})…`);

try {
  const res = await fetch(rawUrl);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const body = await res.text();
  writeFileSync(examplePath, body.endsWith("\n") ? body : `${body}\n`, "utf8");
  console.log(`Updated ${examplePath}`);
} catch (error) {
  console.warn(`Could not download from GitHub: ${error.message}`);
  if (!existsSync(examplePath)) {
    console.error("No local .env.example found. Aborting.");
    process.exit(1);
  }
  console.log("Using existing local .env.example");
}

if (existsSync(envPath)) {
  const current = readFileSync(envPath, "utf8");
  if (/^DATABASE_URL=.+/m.test(current)) {
    console.log(".env already exists with DATABASE_URL — left unchanged.");
    process.exit(0);
  }
  console.log(".env exists but DATABASE_URL is empty — merge from .env.example keys only.");
  const example = readFileSync(examplePath, "utf8");
  const merged = new Map();
  for (const line of `${current}\n${example}`.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!merged.has(key) || value) merged.set(key, value);
  }
  const out = [...merged.entries()].map(([k, v]) => `${k}=${v}`).join("\n") + "\n";
  writeFileSync(envPath, out, "utf8");
  console.log("Merged .env — add DATABASE_URL before running the app.");
  process.exit(0);
}

copyFileSync(examplePath, envPath);
console.log(`Created ${envPath} from GitHub template.`);
console.log("Next: set DATABASE_URL in .env, then run npm run db:deploy && npm run dev");
