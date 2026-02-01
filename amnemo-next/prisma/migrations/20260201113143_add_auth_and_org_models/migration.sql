-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('UTILISATEUR', 'GESTIONNAIRE', 'ADMIN');

-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "sites" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "softwares" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "update_sessions" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "updatedById" INTEGER;

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'UTILISATEUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_organizations" (
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "user_organizations_pkey" PRIMARY KEY ("userId","organizationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "folders_organizationId_idx" ON "folders"("organizationId");

-- CreateIndex
CREATE INDEX "sites_organizationId_idx" ON "sites"("organizationId");

-- CreateIndex
CREATE INDEX "softwares_organizationId_idx" ON "softwares"("organizationId");

-- CreateIndex
CREATE INDEX "tags_organizationId_idx" ON "tags"("organizationId");

-- CreateIndex
CREATE INDEX "tasks_organizationId_idx" ON "tasks"("organizationId");

-- CreateIndex
CREATE INDEX "update_sessions_organizationId_idx" ON "update_sessions"("organizationId");

-- AddForeignKey
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_organizations" ADD CONSTRAINT "user_organizations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "softwares" ADD CONSTRAINT "softwares_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_sessions" ADD CONSTRAINT "update_sessions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
