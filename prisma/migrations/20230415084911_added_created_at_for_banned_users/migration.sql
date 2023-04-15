/*
  Warnings:

  - Added the required column `createdAt` to the `BannedUsers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BannedUsers" ADD COLUMN     "createdAt" TEXT NOT NULL;
