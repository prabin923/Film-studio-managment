-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN "logoData" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Workspace" ADD COLUMN "brandColor" TEXT NOT NULL DEFAULT '#2563eb';
ALTER TABLE "Workspace" ADD COLUMN "brandTextColor" TEXT NOT NULL DEFAULT '#ffffff';
ALTER TABLE "Workspace" ADD COLUMN "brandShape" TEXT NOT NULL DEFAULT 'rounded';
