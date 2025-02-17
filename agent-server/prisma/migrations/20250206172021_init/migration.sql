/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `ownerPhoneNumber` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_ownerId_fkey";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "ownerId",
ADD COLUMN     "ownerPhoneNumber" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_ownerPhoneNumber_fkey" FOREIGN KEY ("ownerPhoneNumber") REFERENCES "Owner"("phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
