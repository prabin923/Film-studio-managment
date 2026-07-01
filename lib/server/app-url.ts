export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not set. Add it to .env.local (e.g. http://localhost:3000) or Vercel → Settings → Environment Variables — required to build safe redirect and email links.",
    );
  }
  return url.replace(/\/+$/, "");
}
