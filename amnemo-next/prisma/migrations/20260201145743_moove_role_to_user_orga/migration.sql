/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_organizations" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'UTILISATEUR';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";
