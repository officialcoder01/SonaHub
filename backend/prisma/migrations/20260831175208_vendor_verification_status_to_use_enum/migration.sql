/*
  Warnings:

  - You are about to drop the column `isVerified` on the `VendorProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'NOT_VERIFIED');

-- AlterTable
ALTER TABLE "VendorProfile" DROP COLUMN "isVerified",
ADD COLUMN     "status" "VerificationStatus" NOT NULL DEFAULT 'NOT_VERIFIED';
