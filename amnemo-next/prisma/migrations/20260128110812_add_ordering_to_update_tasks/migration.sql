-- AlterTable
ALTER TABLE "update_tasks" ADD COLUMN     "machineOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "taskOrder" INTEGER NOT NULL DEFAULT 0;
