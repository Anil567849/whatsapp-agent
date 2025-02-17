/*
  Warnings:

  - You are about to drop the `Agent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `agents` to the `Conversation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_conversationId_fkey";

-- DropForeignKey
ALTER TABLE "Agent" DROP CONSTRAINT "Agent_customerId_fkey";

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "agents" TEXT NOT NULL;

-- DropTable
DROP TABLE "Agent";
