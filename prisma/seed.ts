import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { seed } from "../app/lib/seed";
import { getDatabaseUrl } from "../lib/database-url";
import { hashPassword } from "../lib/server/password";

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const demoEmail = "owner@infinitycreations.com";
  const existing = await prisma.account.findUnique({ where: { email: demoEmail } });
  if (existing) {
    console.log("Seed skipped — demo account already exists.");
    return;
  }

  const workspaceId = "workspace-demo";
  const accountId = "account-demo";

  await prisma.workspace.create({
    data: {
      id: workspaceId,
      studioName: "Infinity Creations",
      phone: "9800000000",
      location: "Kathmandu",
      tagline: "Wedding films with heart",
      ownerEmail: demoEmail,
    },
  });

  await prisma.account.create({
    data: {
      id: accountId,
      workspaceId,
      email: demoEmail,
      passwordHash: hashPassword("demo12345"),
      name: "Studio Owner",
      role: "owner",
    },
  });

  await prisma.client.createMany({
    data: seed.clients.map((client) => ({
      workspaceId,
      ...client,
      createdAt: client.createdAt ?? client.eventDate,
    })),
  });
  await prisma.expense.createMany({
    data: seed.expenses.map((expense) => ({ workspaceId, ...expense })),
  });
  await prisma.staffRecord.createMany({
    data: seed.staff.map((member) => ({ workspaceId, ...member })),
  });
  await prisma.inventoryItem.createMany({
    data: seed.inventory.map((item) => ({ workspaceId, ...item })),
  });
  await prisma.rental.createMany({
    data: seed.rentals.map((rental) => ({ workspaceId, ...rental })),
  });

  console.log("Seeded demo workspace:");
  console.log(`  Email: ${demoEmail}`);
  console.log("  Password: demo12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
