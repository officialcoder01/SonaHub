/*
  Warnings:

  - You are about to drop the column `archievedAt` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Service" DROP COLUMN "archievedAt",
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
