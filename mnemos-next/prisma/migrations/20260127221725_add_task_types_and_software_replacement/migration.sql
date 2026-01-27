-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('DEFAULT', 'SOFTWARE_REPLACEMENT');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "type" "TaskType" NOT NULL DEFAULT 'DEFAULT';

-- AlterTable
ALTER TABLE "update_tasks" ADD COLUMN     "softwareId" INTEGER,
ADD COLUMN     "targetVersion" TEXT;

-- AddForeignKey
ALTER TABLE "update_tasks" ADD CONSTRAINT "update_tasks_softwareId_fkey" FOREIGN KEY ("softwareId") REFERENCES "softwares"("id") ON DELETE SET NULL ON UPDATE CASCADE;
