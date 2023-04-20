/*
  Warnings:

  - Made the column `userId` on table `BannedUsers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bloggerId` on table `BannedUsers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BannedUsers" ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "bloggerId" SET NOT NULL;
