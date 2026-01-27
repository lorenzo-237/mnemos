-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetType" "MachineType" NOT NULL,
    "iconName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_sessions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "folderId" INTEGER,
    "tagId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "update_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_tasks" (
    "id" SERIAL NOT NULL,
    "updateSessionId" INTEGER NOT NULL,
    "machineId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "update_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "update_sessions_folderId_idx" ON "update_sessions"("folderId");

-- CreateIndex
CREATE INDEX "update_sessions_tagId_idx" ON "update_sessions"("tagId");

-- CreateIndex
CREATE INDEX "update_tasks_updateSessionId_idx" ON "update_tasks"("updateSessionId");

-- CreateIndex
CREATE INDEX "update_tasks_machineId_idx" ON "update_tasks"("machineId");

-- CreateIndex
CREATE INDEX "update_tasks_status_idx" ON "update_tasks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "update_tasks_updateSessionId_machineId_taskId_key" ON "update_tasks"("updateSessionId", "machineId", "taskId");

-- AddForeignKey
ALTER TABLE "update_sessions" ADD CONSTRAINT "update_sessions_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_sessions" ADD CONSTRAINT "update_sessions_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_tasks" ADD CONSTRAINT "update_tasks_updateSessionId_fkey" FOREIGN KEY ("updateSessionId") REFERENCES "update_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_tasks" ADD CONSTRAINT "update_tasks_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_tasks" ADD CONSTRAINT "update_tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
