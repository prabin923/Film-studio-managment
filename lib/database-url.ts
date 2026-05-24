const PLACEHOLDER_HOST = "127.0.0.1:5432/build";

/** Normalize DATABASE_URL (trim, strip accidental quotes from Vercel/dashboard paste). */
export function normalizeDatabaseUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let url = raw.trim();
  if (
    (url.startsWith("'") && url.endsWith("'")) ||
    (url.startsWith('"') && url.endsWith('"'))
  ) {
    url = url.slice(1, -1).trim();
  }
  return url || undefined;
}

export function getDatabaseUrl(): string {
  const url = normalizeDatabaseUrl(
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.POSTGRES_PRISMA_URL,
  );

  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Postgres connection string to .env locally or Vercel → Settings → Environment Variables.",
    );
  }

  if (url.includes(PLACEHOLDER_HOST)) {
    throw new Error(
      "DATABASE_URL points to the local build placeholder. Set a real Postgres URL in .env or Vercel.",
    );
  }

  return url;
}

export function hasDatabaseUrl(): boolean {
  try {
    getDatabaseUrl();
    return true;
  } catch {
    return false;
  }
}
