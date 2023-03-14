/*
  Warnings:

  - You are about to drop the column `userId` on the `BanInfo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[banInfoId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `banInfoId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BanInfo" DROP CONSTRAINT "BanInfo_userId_fkey";

-- DropIndex
DROP INDEX "BanInfo_userId_key";

-- AlterTable
ALTER TABLE "BanInfo" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "banInfoId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_banInfoId_key" ON "User"("banInfoId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_banInfoId_fkey" FOREIGN KEY ("banInfoId") REFERENCES "BanInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
