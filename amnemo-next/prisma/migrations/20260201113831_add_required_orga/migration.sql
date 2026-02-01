/*
  Warnings:

  - A unique constraint covering the columns `[name,organizationId]` on the table `folders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organizationId]` on the table `sites` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organizationId]` on the table `softwares` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,organizationId]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - Made the column `organizationId` on table `folders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `sites` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `softwares` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `tags` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `tasks` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organizationId` on table `update_sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "folders_name_key";

-- DropIndex
DROP INDEX "sites_name_key";

-- DropIndex
DROP INDEX "softwares_name_key";

-- DropIndex
DROP INDEX "tags_name_key";

-- AlterTable
ALTER TABLE "folders" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "sites" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "softwares" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "tags" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "organizationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "update_sessions" ALTER COLUMN "organizationId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "folders_name_organizationId_key" ON "folders"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "sites_name_organizationId_key" ON "sites"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "softwares_name_organizationId_key" ON "softwares"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_organizationId_key" ON "tags"("name", "organizationId");
