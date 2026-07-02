import { prisma } from "@/lib/prisma";
import { newId } from "@/app/lib/format";

export function requestIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}

export async function checkRateLimit(
  key: string,
  { max, windowMs }: { max: number; windowMs: number },
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs);

  await prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: windowStart } } });

  const count = await prisma.rateLimitHit.count({ where: { key, createdAt: { gte: windowStart } } });

  await prisma.rateLimitHit.create({ data: { id: newId("hit"), key } });

  return count < max;
}
