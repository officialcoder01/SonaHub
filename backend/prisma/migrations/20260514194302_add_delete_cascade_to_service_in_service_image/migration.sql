-- DropForeignKey
ALTER TABLE "serviceImage" DROP CONSTRAINT "serviceImage_serviceId_fkey";

-- AddForeignKey
ALTER TABLE "serviceImage" ADD CONSTRAINT "serviceImage_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
