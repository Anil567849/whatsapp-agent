/*
  Warnings:

  - You are about to drop the column `agents` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `Conversation` table. All the data in the column will be lost.
  - Added the required column `agent` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhoneNumber` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_customerId_fkey";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "agents",
DROP COLUMN "customerId",
ADD COLUMN     "agent" JSONB NOT NULL,
ADD COLUMN     "customerPhoneNumber" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_customerPhoneNumber_fkey" FOREIGN KEY ("customerPhoneNumber") REFERENCES "Customer"("phoneNumber") ON DELETE RESTRICT ON UPDATE CASCADE;
