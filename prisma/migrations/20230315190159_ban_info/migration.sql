/*
  Warnings:

  - You are about to drop the column `banInfoId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `BanInfo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `BanInfo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_banInfoId_fkey";

-- DropIndex
DROP INDEX "User_banInfoId_key";

-- AlterTable
ALTER TABLE "BanInfo" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "banInfoId";

-- CreateIndex
CREATE UNIQUE INDEX "BanInfo_userId_key" ON "BanInfo"("userId");

-- AddForeignKey
ALTER TABLE "BanInfo" ADD CONSTRAINT "BanInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
