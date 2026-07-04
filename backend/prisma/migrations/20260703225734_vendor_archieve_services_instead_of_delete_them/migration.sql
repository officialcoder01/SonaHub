-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "serviceImage" DROP CONSTRAINT "serviceImage_serviceId_fkey";

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "archievedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "serviceImage" ADD CONSTRAINT "serviceImage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
