import { Prisma } from "../../generated/prisma/client";
import { hasDatabaseUrl } from "../database-url";

export function databaseErrorMessage(error: unknown): string {
  if (!hasDatabaseUrl()) {
    return "Server is missing DATABASE_URL. In Vercel: Project → Settings → Environment Variables → add DATABASE_URL with your Prisma Postgres URL, then redeploy.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021") {
      return "Database tables are missing. Run npm run db:deploy against this database, then try again.";
    }
    if (error.code === "P1001" || error.code === "P1000") {
      return "Cannot reach the database. Check DATABASE_URL and that the database allows connections from Vercel.";
    }
  }

  if (error instanceof Error && error.message.includes("DATABASE_URL")) {
    return error.message;
  }

  return "Database error. Confirm DATABASE_URL on Vercel matches your Prisma Postgres URL and run npm run db:deploy.";
}
