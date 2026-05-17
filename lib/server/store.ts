import { prisma } from "@/lib/prisma";
import type { Account, Client, Expense, InventoryItem, Rental, Staff, Store } from "@/app/lib/types";

export async function loadStore(workspaceId: string): Promise<Store> {
  const [clients, expenses, staff, inventory, rentals] = await Promise.all([
    prisma.client.findMany({ where: { workspaceId } }),
    prisma.expense.findMany({ where: { workspaceId } }),
    prisma.staffRecord.findMany({ where: { workspaceId } }),
    prisma.inventoryItem.findMany({ where: { workspaceId } }),
    prisma.rental.findMany({ where: { workspaceId } }),
  ]);

  return {
    clients: clients as Client[],
    expenses,
    staff: staff as Staff[],
    inventory: inventory as InventoryItem[],
    rentals: rentals as Rental[],
  };
}

export async function saveStore(workspaceId: string, store: Store) {
  const clientIds = store.clients.map((c) => c.id);
  const expenseIds = store.expenses.map((e) => e.id);
  const staffIds = store.staff.map((s) => s.id);
  const inventoryIds = store.inventory.map((i) => i.id);
  const rentalIds = store.rentals.map((r) => r.id);

  await prisma.$transaction(async (tx) => {
    await tx.client.deleteMany({
      where: { workspaceId, ...(clientIds.length ? { id: { notIn: clientIds } } : {}) },
    });
    await tx.expense.deleteMany({
      where: { workspaceId, ...(expenseIds.length ? { id: { notIn: expenseIds } } : {}) },
    });
    await tx.staffRecord.deleteMany({
      where: { workspaceId, ...(staffIds.length ? { id: { notIn: staffIds } } : {}) },
    });
    await tx.inventoryItem.deleteMany({
      where: { workspaceId, ...(inventoryIds.length ? { id: { notIn: inventoryIds } } : {}) },
    });
    await tx.rental.deleteMany({
      where: { workspaceId, ...(rentalIds.length ? { id: { notIn: rentalIds } } : {}) },
    });

    for (const client of store.clients) {
      const row = { ...client, createdAt: client.createdAt ?? client.eventDate };
      await tx.client.upsert({
        where: { id: client.id },
        create: { workspaceId, ...row },
        update: { ...row, workspaceId },
      });
    }
    for (const expense of store.expenses) {
      await tx.expense.upsert({
        where: { id: expense.id },
        create: { workspaceId, ...expense },
        update: { ...expense, workspaceId },
      });
    }
    for (const member of store.staff) {
      await tx.staffRecord.upsert({
        where: { id: member.id },
        create: { workspaceId, ...member },
        update: { ...member, workspaceId },
      });
    }
    for (const item of store.inventory) {
      await tx.inventoryItem.upsert({
        where: { id: item.id },
        create: { workspaceId, ...item },
        update: { ...item, workspaceId },
      });
    }
    for (const rental of store.rentals) {
      await tx.rental.upsert({
        where: { id: rental.id },
        create: { workspaceId, ...rental },
        update: { ...rental, workspaceId },
      });
    }
  });
}

export function accountFromWorkspaceRow(
  workspace: {
    id: string;
    studioName: string;
    phone: string;
    location: string;
    tagline: string;
  },
  account: Pick<Account, "name" | "email" | "role">,
): Account {
  return {
    workspaceId: workspace.id,
    name: account.name,
    email: account.email,
    role: account.role,
    studioName: workspace.studioName,
    phone: workspace.phone,
    location: workspace.location,
    tagline: workspace.tagline,
  };
}
