/*
  Warnings:

  - You are about to drop the `Software` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MachineType" AS ENUM ('SERVER', 'CLIENT');

-- DropTable
DROP TABLE "Software";

-- CreateTable
CREATE TABLE "sites" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machines" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MachineType" NOT NULL,
    "siteId" INTEGER NOT NULL,
    "teamviewerId" TEXT,
    "teamviewerPwd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "softwares" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "softwares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installations" (
    "id" SERIAL NOT NULL,
    "machineId" INTEGER NOT NULL,
    "softwareId" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "installations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sites_name_key" ON "sites"("name");

-- CreateIndex
CREATE INDEX "machines_siteId_idx" ON "machines"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "machines_name_siteId_key" ON "machines"("name", "siteId");

-- CreateIndex
CREATE UNIQUE INDEX "softwares_name_key" ON "softwares"("name");

-- CreateIndex
CREATE INDEX "installations_machineId_softwareId_idx" ON "installations"("machineId", "softwareId");

-- CreateIndex
CREATE INDEX "installations_removedAt_idx" ON "installations"("removedAt");

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installations" ADD CONSTRAINT "installations_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installations" ADD CONSTRAINT "installations_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "softwares"("id") ON DELETE CASCADE ON UPDATE CASCADE;
