-- AlterTable
ALTER TABLE "Client" ADD COLUMN "createdBy" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "createdBy" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "staff" ADD COLUMN "createdBy" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "InventoryItem" ADD COLUMN "createdBy" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Rental" ADD COLUMN "createdBy" TEXT NOT NULL DEFAULT '';
