/*
  Warnings:

  - You are about to drop the column `adminId` on the `Activity` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_adminId_fkey";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "adminId";
