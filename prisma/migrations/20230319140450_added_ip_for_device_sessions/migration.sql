/*
  Warnings:

  - Added the required column `ip` to the `DeviceSessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeviceSessions" ADD COLUMN     "ip" TEXT NOT NULL;
