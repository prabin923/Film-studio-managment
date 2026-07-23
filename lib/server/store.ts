import { brandingFromWorkspace } from "@/app/lib/studio-branding";
import { prisma } from "@/lib/prisma";
import type { Account, Bill, Client, Expense, InventoryItem, Rental, Staff, Store } from "@/app/lib/types";

export async function loadStore(workspaceId: string): Promise<Store> {
  const [clients, expenses, staff, inventory, rentals, bills] = await Promise.all([
    prisma.client.findMany({ where: { workspaceId } }),
    prisma.expense.findMany({ where: { workspaceId } }),
    prisma.staffRecord.findMany({ where: { workspaceId } }),
    prisma.inventoryItem.findMany({ where: { workspaceId } }),
    prisma.rental.findMany({ where: { workspaceId } }),
    prisma.bill.findMany({
      where: { workspaceId },
      include: { lineItems: { orderBy: { position: "asc" } } },
      orderBy: [{ issueDate: "desc" }, { number: "desc" }],
    }),
  ]);

  return {
    clients: clients as Client[],
    expenses,
    staff: staff as Staff[],
    inventory: inventory as InventoryItem[],
    rentals: rentals as Rental[],
    bills: bills.map(({ lineItems, ...bill }) => ({
      ...bill,
      lineItems: lineItems.map(({ billId: _billId, position: _position, ...line }) => line),
    })) as Bill[],
  };
}

export async function saveStore(workspaceId: string, store: Store) {
  const clientIds = store.clients.map((c) => c.id);
  const expenseIds = store.expenses.map((e) => e.id);
  const staffIds = store.staff.map((s) => s.id);
  const inventoryIds = store.inventory.map((i) => i.id);
  const rentalIds = store.rentals.map((r) => r.id);
  // Older open tabs can still send a snapshot without the newly added bills
  // collection. In that case, leave existing bills untouched instead of
  // interpreting the missing property as a request to delete them all.
  const bills = Array.isArray(store.bills) ? store.bills : null;
  const billIds = bills?.map((bill) => bill.id) ?? [];

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
    if (bills) {
      await tx.bill.deleteMany({
        where: { workspaceId, ...(billIds.length ? { id: { notIn: billIds } } : {}) },
      });
    }

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
    for (const bill of bills ?? []) {
      const { lineItems, ...row } = bill;
      await tx.bill.upsert({
        where: { id: bill.id },
        create: { workspaceId, ...row },
        update: { ...row, workspaceId },
      });
      await tx.billLine.deleteMany({ where: { billId: bill.id } });
      if (lineItems.length) {
        await tx.billLine.createMany({
          data: lineItems.map((line, position) => ({ ...line, billId: bill.id, position })),
        });
      }
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
    logoData?: string | null;
    brandColor?: string | null;
    brandTextColor?: string | null;
    brandShape?: string | null;
    currency?: string | null;
    locale?: string | null;
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
    currency: workspace.currency ?? "NPR",
    locale: workspace.locale ?? "en-NP",
    ...brandingFromWorkspace(workspace),
  };
}
